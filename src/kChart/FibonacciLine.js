
define(
    function (require) {
        //var Group = require('zrender/Group');
        var AssistLine = require('./AssistLine');
        var LineShape = require('../shape/Line');
        
        var intervals=[0,23.6,38.2,50.0,61.8,100,161.8,261.8,423.6];
        
        var FibonacciLine = function (options,zr,config) {
            options.pName="fib";
            this.lines=[];//new Array();
            AssistLine.call(this,options,zr,config);
            
        };

        FibonacciLine.prototype =  {
            type: 'fibonacciLine',
            //绘制黄金分割线
            buildLines:function(){
                //this.pointBegin
                //this.intervals
                //this.pointEnd
                //便于压缩
                var bp=this.pointBegin,ep=this.pointEnd;
                var b={
                    x:bp.style.x+bp.position[0],
                    y:bp.style.y+bp.position[1]
                },e={
                    x:ep.style.x+ep.position[0],
                    y:ep.style.y+ep.position[1]
                };
                var min_X=Math.min(b.x,e.x)+5;
                var max_X=Math.max(b.x,e.x)-5;
                var perY=(b.y-e.y)/100;

                for (var i =0; i<intervals.length; i++) {
                    var y=e.y+intervals[i]*perY;
                    this._createLine(i,min_X,max_X,y,intervals[i]);
                }
            },
            //设置直线属性
            _createLine:function(index,min_X,max_X,y,text){
                var line=this.lines[index];
                if(line){
                    var s=line.style;
                    s.xStart=min_X;
                    s.yStart=y;
                    s.xEnd=max_X;
                    s.yEnd=y;
                    return;
                }
                line=new LineShape({
                    //id:"fibonacciSub"+index,
                    style:{
                        xStart: min_X,
                        yStart: y,
                        xEnd: max_X,
                        yEnd: y,
                        strokeColor: 'blue',
                        lineWidth: 1,
                        text:text
                    }
                });
                line.zlevel=1;
                this.chartGroup.addChild(line);
                this.lines.push(line);
            }
        };
        require('../tool/util').inherits(FibonacciLine, AssistLine);
        return FibonacciLine;
    }
);
