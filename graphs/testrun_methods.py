from testrun import EndOfGameStats, SolverFeatures, Game, Testrun


def winrate(testrun: Testrun) -> float:
    return len([g for g in testrun.games if g.endStats.won]) / len(testrun.games)


def clearrate(testrun: Testrun) -> float:
    return len([g for g in testrun.games if g.endStats.cleared]) / len(testrun.games)
