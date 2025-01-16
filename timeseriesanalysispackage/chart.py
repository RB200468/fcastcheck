import json
class Chart:
    def __init__(self, timeLabels, yData, yTitle=None, dataLabel=None):
            self.__labels = timeLabels
            self.__data = yData
            self.__label = dataLabel if dataLabel else ""
            self.__title = yTitle if yTitle else ""

            # Default options
            self.__borderColor = '#0069C3'
            self.__tension = 0.3
            self.__fill = False
        
            self.__chartData = {
                "labels": self.__labels,
                "data": self.__data,
                "label": self.__label,
                "borderColor": self.__borderColor,
                "tension": self.__tension,
                "fill": self.__fill,
                "title": self.__title
            }
    
    def options(self, borderColor=None, tension=None, fill=None):
        if borderColor:
            self.__chartData["borderColor"] = borderColor
        if tension:
            self.__chartData["tension"] = tension
        if fill:
            self.__chartData["fill"] = fill
        
    def getChartData(self):
         return self.__chartData
        
        


