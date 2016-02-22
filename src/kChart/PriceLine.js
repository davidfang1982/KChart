
define(
    function (require) {
        var Group = require('../Group');
        var Rectangle = require('../shape/Rectangle');
        var LineShape = require('../shape/Line');
        var Text = require('../shape/Text');
        var chartGroup;
        var PriceLine = function (options,zr) {
            Group.call(this, options);
            chartGroup=zr.storage.get('chartGroup');
            this.buildPath(options.style);
            chartGroup.cPainter.onUpdate(this);
        };

        PriceLine.prototype =  {
            type: 'priceLine',
            clickable : true,
            /**
             * 创建蜡烛形状
             * @param {CanvasRenderingContext2D} ctx
             * @param {Object} style
             */
            buildPath : function (style) {
                style.y=style.y||0;
                if(!this.line){
                    //创建line
                    this.line=new LineShape({
                        style:{
                            xStart: 0,
                            yStart: style.y,
                            xEnd: style.lineWidth,
                            yEnd: style.y,
                            strokeColor: '#fff',
                            lineWidth: 1
                        }
                    });
                    this.line.zlevel=2;
                    this.addChild(this.line);
                }else{
                    this.line.style.yStart=style.y;
                    this.line.style.yEnd=style.y;
                }

                if(!this.rect){
                    this.rect= new Rectangle({
                        hoverable:false,
                        style: {
                            x: style.lineWidth,
                            y: style.y-(style.rectHeight||20)/2,
                            width: (style.rectWidth||100)-5,
                            height: style.rectHeight||20,
                            color:style.rectColor||'white'
                        }
                    });
                    this.rect.zlevel=2;
                    this.addChild(this.rect);
                }else{
                    this.rect.style.y=style.y;
                }

                if(!this.text){
                    this.text=new Text({
                        hoverable:false,
                        style: {
                            text: style.price||'price',
                            x: style.lineWidth+5,
                            y: style.y-(style.rectHeight||20)/2,
                            color:'red',
                            textBaseline:'top',
                            strokeColor:'yellow',
                            textFont: 'bold 14px Arial '
                         }
                     });
                    this.text.zlevel=2;
                    this.addChild(this.text);
                }else{
                    this.text.style.y=style.y;
                }
            },
            show:function(){
                this.line.invisible=false;
                this.rect.invisible=false;
                this.text.invisible=false;
            },
            hide:function(){
                this.line.invisible=true;
                this.rect.invisible=true;
                this.text.invisible=true;
            },
            //价格更新时执行
            whenUpdate:function(data,index,y){
               if (this.line.invisible) return;
               this.text.style.text=data[1];//收盘价
               this.position[1]=y;
            },
            /**
             * 计算返回矩形包围盒矩阵
             * @param {module:zrender/shape/Rectangle~IRectangleStyle} style
             * @return {module:zrender/shape/Base~IBoundingRect}
             */
            getRect : function(style) {
                if (style.__rect) {
                    return style.__rect;
                }
                
                style.__rect = {
                    x : 0,
                    y : style.y-(style.rectHeight||20)/2,
                    width : style.lineWidth+style.rectHeight,//style.width + lineWidth,
                    height : style.rectHeight//style.height + lineWidth
                };
                
                return style.__rect;
            }
        };

        require('../tool/util').inherits(PriceLine, Group);
        return PriceLine;
    }
);
