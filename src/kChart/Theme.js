
define(
    function (require) {
        
        var Theme = function (zr) {
            this.zr=zr;
            this.zr.theme={};
            zr.painter.root.style.background="black";
        };

        Theme.prototype =  {
            fill:function(){
               //return;
               this.zr.theme={
                    background:"cyan",
                    KAxis_X_bg:"#ffffff",
                    KAxis_Y_bg:"#ffffff",
                    KAxis_text_bg:"black",
                    KAxis_text_font:"14px bold Arial",//默认'12px Arial'
                    KAxis_XLine_bg:"rgb(155, 192, 227)",//
                    KAxis_YLine_bg:"rgb(155, 192, 227)",//
                    KAxis_AxisLine_bg:"rgb(125, 162, 197)",//___|的颜色
                    KAxis_price_text_font:"",
                    KAxis_price_text_color:"black",
                    Candle_line_color:"rgb(216, 146, 144)",//中间线颜色
                    Candle_up_bg:"rgb(194, 53, 49)",//价格上升背景
                    Candle_down_bg:"rgb(49, 70, 86)",//价格下降背景

                    CrossLine_line_color:"red",
                    CrossLine_rect_bg:"#34495e",
                    CrossLine_rect_color:"#FFFFFF",
                    CrossLine_rect_font:"",
                    CrossLine_tip_bg:"#34495e",
                    CrossLine_tip_color:"#FFFFFF",
                    CrossLine_tip_font:"",


                    AssistLine_line_color:"",
                    AssistLine_line_width:2,

                    FibonacciLine_line_color:"blue",
                    FibonacciLine_text_color:"blue",

                    PriceLine_line_color:"#34495e",
                    PriceLine_rect_color:"#FFFFFF",
                    PriceLine_rect_bg:"#34495e",
                    PriceLine_rect_font:""

               };
               this.zr.painter.root.style.background=this.zr.theme.background;
            }
        };
        return Theme;
    }
);
