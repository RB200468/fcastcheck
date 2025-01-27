import json
class Chart:
    def __init__(self, timeLabels, yData, yTitle=None, dataLabel=None):
            self.__labels = timeLabels
            self.__data = yData
            self.__label = dataLabel if dataLabel else ""
            self.__title = yTitle if yTitle else ""

            # Default options
            self.__borderColor = '#0069C3'
            self.__backgroundColor = '#0069C3'
            self.__tension = 0.3
            self.__fill = False
        
            self.__chartData = {
                 "labels": self.__labels,
                 "title": self.__title,
                 "datasets": [
                    {
                        "label": self.__label,
                        "data": self.__data,
                        "borderColor": self.__borderColor,
                        "backgroundColor": self.__backgroundColor,
                        "tension": self.__tension,
                        "fill": self.__fill,
                    }
                 ]
            }
    
    def options(self, borderColor=None, tension=None, fill=None, backgroundColor=None):
        if borderColor:
            self.__chartData["borderColor"] = borderColor
        if tension:
            self.__chartData["tension"] = tension
        if fill:
            self.__chartData["fill"] = fill
        if backgroundColor:
             self.__chartData["backgroundColor"] = backgroundColor
        
    def getChartData(self):
         return self.__chartData
        
        


