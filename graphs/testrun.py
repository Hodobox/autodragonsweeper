import json
import re
import os
from dataclasses import dataclass, field


@dataclass
class EndOfGameStats:
    won: bool = False
    cleared: bool = False
    score: int = 0
    damageToGo: int = 0
    hpLeftOver: int = -1  # iff cleared


@dataclass
class SolverFeatures:
    edgeSlimeDetections: int = 0
    adjSlimeDetections: int = 0
    gargoylesSpotted: int = 0
    minotaursSpottingChests: int = 0
    chestsSpottingMinotaurs: int = 0
    mimicsFoundByMinotaurs: int = 0
    deducedOddOneOut: int = 0
    deducedUpperBound: int = 0
    deducedOddMineOut: int = 0
    mineKingGuesses: int = 0
    panicking: int = 0
    sharedMinesForceOthersOut: int = 0
    shiftedUnknownSquaresTiedTogether: int = 0
    shiftedUnknownSquaresBoundByAnother: int = 0
    tookLoverWhenNoHeals: int = 0


@dataclass
class Game:
    endStats: EndOfGameStats
    features: SolverFeatures = field(default_factory=SolverFeatures)

    tookRisk: bool = False
    freeActions: int = 0
    nonfreeActions: int = 0
    mineKingOpportunitiesMissed: int = 0
    earlyWallHits: int = 0
    seed: int = -1


@dataclass
class Testrun:
    label: str
    games: list[Game]
    index: int


def _load_games_from_file(fname: str) -> list[Game]:
    with open(fname, "r") as testrun_f:
        testruns_json = json.load(testrun_f)

    for testrun in testruns_json:
        testrun["features"] = SolverFeatures(**testrun.get("features", {}))
        testrun["endStats"] = EndOfGameStats(**testrun["endStats"])
        for buggy_feature in ["minotaursSpottingChests", "chestsSpottingMinotaurs"]:
            if buggy_feature in testrun:  # bugged key in some testruns
                del testrun[buggy_feature]

    games = [Game(**testrun) for testrun in testruns_json]
    return games


def load_testrun(testrun_file: str, testrun_label: str, idx: int) -> Testrun:
    return Testrun(
        label=testrun_label, games=_load_games_from_file(testrun_file), index=idx
    )


def load_testruns(testrun_folder: str, testrun_order_fname: str) -> list[Testrun]:

    with open(testrun_order_fname, "r") as t_order_f:
        t_order = [l.strip() for l in t_order_f.readlines()]

    testrun_regex = r"v[0-9]+_?(.*)\.json"

    testruns: list[Testrun] = []
    for idx, testrun_f in enumerate(t_order):
        t_fname = os.path.join(testrun_folder, testrun_f)
        t_label = re.match(testrun_regex, testrun_f).group(1)

        testrun = load_testrun(t_fname, t_label, idx + 1)
        testruns.append(testrun)

    return testruns
