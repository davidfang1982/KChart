
define(
    function (require) {
        var Base = require('../Group');
        var Rectangle = require('../shape/Rectangle');
        var LineShape = require('../shape/Line');
        var Text = require('../shape/Text');
        
        var CrossLine = function (options,group) {
            Base.call(this, options);
            this.group=group;
            this.init=false;
            this.buildPath(options.style);
        };

        CrossLine.prototype =  {
            type: 'crossLine',
            clickable : true,
            /**
             * 创建蜡烛形状
             * @param {CanvasRenderingContext2D} ctx
             * @param {Object} style
             */
             //candleData
            buildPath : function (style) {
                style.y=style.y||0;
                if(!this.init){//记录一下创建时的相关属性，便于其他方法中使用
                    //底部和右侧矩形的宽高
                    this.rectHeight=style.rectHeigh||20;
                    this.rectWidth=style.rectWidth||100;
                    this.halfRectWidth=this.rectWidth/2;
                    //十字线的宽度和长度，其实就是pWidth和pHeight
                    this.lineHeight=style.lineHeight;
                    this.lineWidth=style.lineWidth;
                    //tip局限的宽高
                    this.tipRectWidth=style.tipRectWidth;
                    this.tipRectHeight=style.tipRectHeight;
                    this.init=true;
                }
                style.index=style.index||0;
                style.tipRectColor=style.tipRectColor||"black";
                style.textColor=style.textColor||'#000';
                //垂直线
                if(!this.verticalLine){
                    //创建line
                    this.verticalLine=new LineShape({
                        id:"verticalLine",
                        style:{
                            xStart: style.x,
                            yStart: 0,
                            xEnd: style.x,
                            yEnd: style.lineHeight,
                            strokeColor: style.tipRectColor,
                            lineWidth: 1
                        }
                    });
                    this.verticalLine.zlevel=2;
                    this.addChild(this.verticalLine);
                }else{
                    this.verticalLine.style.xStart=style.x;
                    this.verticalLine.style.xEnd=style.x;
                }
                //水平线
                if(!this.horizLine){
                    //创建line
                    this.horizLine=new LineShape({
                        id:"horizLine",
                        style:{
                            xStart: 0,
                            yStart: style.y,
                            xEnd: style.lineWidth,
                            yEnd: style.y,
                            strokeColor: style.tipRectColor,
                            lineWidth: 1
                        }
                    });
                    this.horizLine.zlevel=2;
                    this.addChild(this.horizLine);
                }else{
                    this.horizLine.style.yStart=style.y;
                    this.horizLine.style.yEnd=style.y;
                }
                //价格背景
                if(!this.priceRect){
                    this.priceRect= new Rectangle({
                        hoverable:false,
                        style: {
                            x: style.lineWidth,
                            y: style.y-(style.rectHeight||20)/2,
                            width: (style.rectWidth)-5,
                            height: style.rectHeight,
                            color:style.rectColor||'white'
                        }
                    });
                    this.priceRect.zlevel=3;
                    this.addChild(this.priceRect);
                }else{
                    this.priceRect.style.y=style.y;
                }
                //价格文字
                if(!this.priceText){
                    this.priceText=new Text({
                        id:"crossPrice",
                        hoverable:false,
                        style: {
                            text: style.price||'price',
                            x: style.lineWidth+5,
                            y: style.y-(style.rectHeight)/2,
                            color:style.textColor,
                            textBaseline:'top',
                            strokeColor:'yellow',
                            textFont: 'bold 14px Arial '
                         }
                     });
                    this.priceText.zlevel=3;
                    this.addChild(this.priceText);
                }else{
                    this.priceText.style.y=style.y;
                    this.priceText.style.text=style.price;
                    //强制刷新text，此处需要修改shape/Text getRect方法源码
                    this.priceText.modSelf();
                }

                //时间背景
                if(!this.timeRect){
                    this.timeRect= new Rectangle({
                        hoverable:false,
                        style: {
                            x: style.x-(style.rectWidth)/2,
                            y: style.lineHeight+2,
                            width: (style.rectWidth),
                            height: style.rectHeight,
                            color:style.rectColor||'white'
                        }
                    });
                    this.timeRect.zlevel=3;
                    this.addChild(this.timeRect);
                }else{
                    this.timeRect.style.x=style.x-this.halfRectWidth;
                }

                //时间文字
                if(!this.timeText){
                    this.timeText=new Text({
                        id:"crossTime",
                        hoverable:false,
                        style: {
                            text: style.time||'time',
                            x: style.x,
                            y: style.lineHeight+2,
                            color:style.textColor,
                            textAlign:'center',
                            textBaseline:'top',
                            strokeColor:'yellow',
                            textFont: 'bold 14px Arial '
                         }
                     });
                    this.timeText.zlevel=3;
                    this.addChild(this.timeText);
                }else{
                    this.timeText.style.x=style.x;
                    this.timeText.style.text=style.time;
                    //强制刷新text，此处需要修改shape/Text getRect方法源码
                    this.timeText.modSelf();
                }

                //绘制一个矩形 zlevel=3，this.tipRect
                //计算位置,首次，放到右上角
                var ret=this._getTipRectLoc(style.x,style.y);
                 if(!this.tipRect){
                    this.tipRect= new Rectangle({
                        hoverable:false,
                        style: {
                            x: 0,
                            y: 0,
                            width: style.tipRectWidth,
                            height: style.tipRectHeight,
                            color:style.tipRectColor||'cyan'
                        }
                    });
                    
                    this.tipRect.zlevel=2;
                    this.addChild(this.tipRect);
                 }else{
                    this.tipRect.style.x=ret.x;
                    this.tipRect.style.y=ret.y;
                 }

                 //
                 //时间文字
                if(!this.tipText){
                    this.tipText=new Text({
                        id:"crossTip",
                        hoverable:false,
                        style: {
                            text: style.time||'time',
                            x: ret.x,
                            y: ret.y,
                            color:"#FFF",
                            textAlign:'start',
                            textBaseline:'top',
                            textFont: '14px Arial '
                         }
                     });
                    this.tipText.zlevel=2;
                    this.addChild(this.tipText);
                }else{
                    this.tipText.style.x=ret.x+10;
                    this.tipText.style.y=ret.y;
                    this.tipText.style.text=style.time+"\n"+style.price;
                    //强制刷新text，此处需要修改shape/Text getRect方法源码
                    this.tipText.modSelf();
                }

                if(style.index<0)
                {
                    this.tipText.invisible=true;
                    this.tipRect.invisible=true;
                }else{
                    this.tipText.invisible=false;
                    this.tipRect.invisible=false;
                }

            },
            //计算tipRect的位置
            _getTipRectLoc:function(x,y){
                x=x||(this.lineWidth/2);
                y=y||(this.lineHeight/2);
                if(x+this.tipRectWidth+10>this.lineWidth)
                    x=x-this.tipRectWidth-20;
                if(y<this.tipRectHeight+20)
                    y=y+this.tipRectHeight+20;
                return {x:x+10,y:y-this.tipRectHeight-10};
            },
            show:function(){
                this.eachChild(function(shape){
                    shape.invisible=false;
                });
               
               
            },
            hide:function(){
                this.eachChild(function(shape){
                    shape.invisible=true;
                });
            }
        };

        require('../tool/util').inherits(CrossLine, Base);
        return CrossLine;
    }
);
