import json
import sys

if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} testrun_file")
    exit(0)

testrun_file: str = sys.argv[1]

with open(testrun_file, "r") as f:
    games = json.load(f)

n: int = len(games)

lost = [g for g in games if not g["endStats"]["won"]]
won = [g for g in games if g["endStats"]["won"]]
won_failed = [g for g in won if not g["endStats"]["cleared"]]
cleared = [g for g in won if g["endStats"]["cleared"]]
print(
    f"{n} games: {len(won)} won, {len(cleared)} cleared ({len(won_failed)} won but failed to clear)"
)

took_risk_won = sum([g["tookRisk"] for g in won]) / max(len(won), 1)
took_risk_won_failed = sum([g["tookRisk"] for g in won_failed]) / max(
    len(won_failed), 1
)
took_risk_cleared = sum([g["tookRisk"] for g in cleared]) / max(len(cleared), 1)
print(
    f"Had to risk it in {took_risk_won*100:.1f}% of won games; {took_risk_won_failed*100:.1f}% when no clear, {took_risk_cleared*100:.1f}% when clear"
)


def ave_wall_hit(games: list[dict]) -> float:
    hits: int = sum([g["earlyWallHits"] for g in games])
    return hits / max(len(games), 1)


print(
    f"Average early wall hits: {ave_wall_hit(cleared):.2f} when cleared, {ave_wall_hit(won_failed):.2f} when won without clear, {ave_wall_hit(lost):.2f} when lost"
)


def ave_mk_misses(games: list[dict]) -> float:
    misses: int = sum([g["mineKingOpportunitiesMissed"] for g in games])
    return misses / max(len(games), 1)


print(
    f"Average mine king delay: {ave_mk_misses(cleared):.2f} when cleared, {ave_mk_misses(won_failed):.2f} when won without clear"
)


def ave_score(games: list[dict]) -> float:
    score: int = sum([g["endStats"]["score"] for g in games])
    return score / max(len(games), 1)


print(f"When lost, on average had {ave_score(lost):.2f} score")
print(f"When won without clear, on average had {ave_score(won_failed):.2f} score")


def ave_dmg_to_go(games: list[dict]) -> float:
    dmg: int = sum([g["endStats"]["damageToGo"] for g in games])
    return dmg / max(len(games), 1)


print(
    f"When won without clear, on average had {ave_dmg_to_go(won_failed):.2f} damage to go"
)


def ave_hp_left(games: list[dict]) -> float:
    hp: int = sum([g["endStats"]["hpLeftOver"] for g in games])
    return hp / max(len(games), 1)


print(f"When cleared, on average had {ave_hp_left(cleared):.2f} hp left over")

most_hp_left: int = max([g["endStats"]["hpLeftOver"] for g in cleared] + [-1])
most_hp_occured: int = len(
    [g for g in cleared if g["endStats"]["hpLeftOver"] == most_hp_left]
)
print(f"Most hp left when cleared: {most_hp_left} (happened {most_hp_occured} times)")

print(f"Lost without risk: {len([g for g in lost if not g['tookRisk']])}")


def get_feature_occ_and_ave(games: list[dict], f: str) -> tuple[int, float]:
    occ: int = sum([g.get("features", {}).get(f, 0) for g in games])
    return occ, occ / max(len(games), 1)


print(f"-- Features --")
features: dict[str, float] = games[0].get("features", {})
for f in features.keys():
    print(f"{f}")
    for gs, t in [
        (won, "won"),
        (cleared, "cleared"),
        (won_failed, "won but no clear"),
        (lost, "lost"),
    ]:
        occ, ave = get_feature_occ_and_ave(gs, f)
        print(f"\t{occ} times (average {ave:.3f}) in {t} games")
