class Chart:
    def __init__(self, xdata, ydata, xlabel, ylabel, title=None):
        self.title = title
        self.xdata = xdata
        self.ydata = ydata
        self.xlabel = xlabel
        self.ylabel = ylabel

    def get_chart():
        print('{')
        print(f' title: {self.title}')
        print(f' xdata: {self.xdata}')
        print(f' ydata: {self.ydata}')
        print(f' xlabel: {self.xlabel}')
        print(f' ylabel: {self.ylabel}')
        print('}')
