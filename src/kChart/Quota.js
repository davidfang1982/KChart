
define(
    function (require) {
        var PolylineShape = require('../shape/Polyline');
        //var count=0;
        var intervals=[0,23.6,38.2,50.0,61.8,100,161.8,261.8,423.6];
        
        var Quota = function (zr) {
            this.chartGroup=zr.storage.get('chartGroup');
            this.cPainter=this.chartGroup.cPainter;
            this.chartGroup.cPainter.onPaint(this);
            this.whenPaint();
            this.zr=zr;
        };

        Quota.prototype =  {
            type: 'quota',
            //绘制黄金分割线
            dispose:function(){
                var shape=this.zr.storage.get('quota');
                this.chartGroup.removeChild(shape);
                this.disposed=true;
                this.chartGroup.cPainter.rmPaint(this);
            },
            whenPaint:function(){
                if(this.disposed){
                    return;
                }
                var list=[];//new Array();
                for(var t=this.cPainter.showBegin;t<this.cPainter.showEnd;t++){
                    var prev=this.cPainter.getCandleByIndex(t);
                    if(t>this.cPainter.candleQueue.size()-1){
                        break;
                    }
                    if(prev)
                        list.push([prev.style.x,prev.style.rTop]);
                }
                //t,prev.style.x,curr.style.x,prev.style.tTop,curr.style.tTop
                this._createLine(list);
            },
            //设置直线属性
            _createLine:function(pointList){
                
                if(this.line){
                    this.line.style.pointList=pointList;
                    return;
                }
                this.line=new PolylineShape({
                    id:"quota",
                    style : {
                        pointList : pointList,
                        strokeColor : "blue",
                        lineWidth : 3
                    },
                });
                this.line.zlevel=2;
                //this.line.position[1]=300;
                this.chartGroup.addChild(this.line);
            }
        };
        return Quota;
    }
);
