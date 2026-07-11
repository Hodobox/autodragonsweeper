import sys
from testrun import load_testruns
from testrun_methods import clearrate
import matplotlib.pyplot as plt

if len(sys.argv) != 3:
    print(f"Usage: {sys.argv[0]} testrun_folder testrun_order_file")
    exit(0)

testrun_folder, testrun_order_fname = sys.argv[1:]

testruns = load_testruns(
    testrun_folder=testrun_folder, testrun_order_fname=testrun_order_fname
)

winrates = [clearrate(trun) for trun in testruns]

plt.plot([tr.index for tr in testruns], winrates)
plt.show()
