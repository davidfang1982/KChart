
define(
    function (require) {
        
        var Theme = function (zr) {
            this.zr=zr;
            zr.painter.root.style.background="black";
        };

        Theme.prototype =  {
            fill:function(){
               this.zr.theme={};return;
               this.zr.theme={
                    KAxis_X_bg:"#ffffff",
                    KAxis_Y_bg:"#ffffff",
                    KAxis_text_bg:"black",
                    KAxis_text_font:"12px bold Arial",//默认'12px Arial'
                    KAxis_XLine_bg:"rgb(155, 192, 227)",//
                    KAxis_YLine_bg:"rgb(155, 192, 227)",//
                    KAxis_AxisLine_bg:"rgb(125, 162, 197)",//___|的颜色

                    Candle_line_color:"rgb(216, 146, 144)",//中间线颜色
                    Candle_up_bg:"rgb(194, 53, 49)",//价格上升背景
                    Candle_down_bg:"rgb(49, 70, 86)"//价格下降北京
               };
               
            }
        };
        return Theme;
    }
);
