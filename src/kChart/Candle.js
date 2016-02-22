
define(function (require) {
        var Base = require('../shape/Base');
        
        var Candle = function (options) {
            Base.call(this, options);
        };

        Candle.prototype =  {
            type: 'candle',
            clickable : true,
            /**
             * 创建蜡烛形状
             * @param {CanvasRenderingContext2D} ctx
             * @param {Object} style
             */
            buildPath : function (ctx, style) {
                //设置
                //中点x
                //y rtop距离上边界的距离
                //rTop和rBottom
                //top和bottom 
                //半径radius
                //white为true时为白色
                style.y=style.y||0;
                this.hoverable=false;
                if (!style.radius) {
                    style.radius=3;//默认3px
                }
                if(style.rBottom<style.rTop){
                    var tmp=style.rTop;
                    style.rTop=style.rBottom;
                    style.rBottom=tmp;
                }
                var rectWidth=style.radius*2;
                var rectHeight=style.rBottom-style.rTop;
                var rectMoveto={x:style.x-style.radius,y:style.rTop+style.y};
                
                //ctx.closePath();
                
                //绘制直线
                ctx.beginPath();
                ctx.moveTo(style.x, style.top+style.y);
                style._color=style.white?'yellow':"yellow";
                ctx.strokeStyle=style._color;
                ctx.lineWidth=1;
                ctx.lineTo(style.x, style.bottom+style.y);
                ctx.stroke();
                //ctx.closePath();


                //绘制矩形
                ctx.beginPath();
                ctx.moveTo(rectMoveto.x, rectMoveto.y);
                ctx.lineTo(rectMoveto.x + rectWidth, rectMoveto.y);
                ctx.lineTo(rectMoveto.x + rectWidth, rectMoveto.y + rectHeight);
                ctx.lineTo(rectMoveto.x, rectMoveto.y + rectHeight);
                ctx.lineTo(rectMoveto.x, rectMoveto.y);
                ctx.lineWidth=2;
                ctx.fillStyle=style.white?'white':'black';
                ctx.strokeStyle='yellow';
                ctx.fill();
                ctx.stroke();

                // ctx.save();
                // ctx.fillStyle="#fff";
                // ctx.fillText(this.IBoundingRect,rectMoveto.x,30);
                // ctx.restore();
                return;
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
                
                var lineWidth;
                if (style.brushType == 'stroke' || style.brushType == 'fill') {
                    lineWidth = style.lineWidth || 1;
                }
                else {
                    lineWidth = 0;
                }
                style.__rect = {
                    x : style.x - style.radius,
                    y : style.y + style.rTop,
                    width : style.radius*2,//style.width + lineWidth,
                    height : Math.max(style.top,style.rTop)+Math.max(style.bottom,style.rBottom)//style.height + lineWidth
                };
                
                return style.__rect;
            }
        };

        require('../tool/util').inherits(Candle, Base);
        return Candle;
    }
);
