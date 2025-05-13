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

for gs,t in [ (lost,'lost'),(won_failed,'won_failed'),(games,'all') ]:
    print(f'{t} game seeds:')
    seeds = [ g.get('seed',None) for g in gs ][::-1]
    print([s for s in seeds if s != None])
