import json
import sys

if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} testrun_file")
    exit(0)

tetsrun_file: str = sys.argv[1]

with open(tetsrun_file, "r") as f:
    data = json.load(f)

n: int = len(data)

lost = [g for g in data if not g["endStats"]["won"]]
won = [g for g in data if g["endStats"]["won"]]
won_failed = [g for g in won if not g["endStats"]["cleared"]]
cleared = [g for g in won if g["endStats"]["cleared"]]
print(
    f"{n} games: {len(won)} won, {len(cleared)} cleared ({len(won_failed)} won but failed to clear)"
)

took_risk_won = sum([g["tookRisk"] for g in won]) / len(won)
took_risk_won_failed = sum([g["tookRisk"] for g in won_failed]) / len(won_failed)
took_risk_cleared = sum([g["tookRisk"] for g in cleared]) / len(cleared)
print(
    f"Had to risk it in {took_risk_won*100:.1f}% of won games; {took_risk_won_failed*100:.1f}% when no clear, {took_risk_cleared*100:.1f}% when clear"
)


def ave_wall_hit(games: list[dict]) -> float:
    hits: int = sum([g["earlyWallHits"] for g in games])
    return hits / len(games)


print(
    f"Average early wall hits: {ave_wall_hit(cleared):.2f} when cleared, {ave_wall_hit(won_failed):.2f} when won without clear, {ave_wall_hit(lost):.2f} when lost"
)


def ave_mk_misses(games: list[dict]) -> float:
    misses: int = sum([g["mineKingOpportunitiesMissed"] for g in games])
    return misses / len(games)


print(
    f"Average mine king delay: {ave_mk_misses(cleared):.2f} when cleared, {ave_mk_misses(won_failed):.2f} when won without clear"
)


def ave_score(games: list[dict]) -> float:
    score: int = sum([g["endStats"]["score"] for g in games])
    return score / len(games)


print(f"When won without clear, on average had {ave_score(won_failed):.2f} score")


def ave_dmg_to_go(games: list[dict]) -> float:
    dmg: int = sum([g["endStats"]["damageToGo"] for g in games])
    return dmg / len(games)


print(
    f"When won without clear, on average had {ave_dmg_to_go(won_failed):.2f} damage to go"
)


def ave_hp_left(games: list[dict]) -> float:
    hp: int = sum([g["endStats"]["hpLeftOver"] for g in games])
    return hp / len(games)


print(f"When cleared, on average had {ave_hp_left(cleared):.2f} hp left over")

most_hp_left: int = max([g["endStats"]["hpLeftOver"] for g in cleared])
most_hp_occured: int = len(
    [g for g in cleared if g["endStats"]["hpLeftOver"] == most_hp_left]
)
print(f"Most hp left when cleared: {most_hp_left} (happened {most_hp_occured} times)")
