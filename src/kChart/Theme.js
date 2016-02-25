
define(
    function (require) {
        
        var Theme = function (zr) {
            this.zr=zr;
            this.init();
        };

        Theme.prototype =  {
            fill:function(theme){
                require('../tool/util').merge(this.zr.theme,theme,true);
                this.zr.painter.root.style.background=this.zr.theme.background||"black";
            },
            init:function(){
               // this.zr.theme={};return;
               this.zr.theme={
                    background:"cyan",//背景色
                    KAxis_X_bg:"#ffffff",//坐标X轴背景色
                    KAxis_Y_bg:"#ffffff",//坐标Y轴背景色
                    KAxis_text_color:"black",//坐标轴文字颜色
                    KAxis_text_font:"14px bold Arial",//坐标轴文字字体，默认'12px Arial'
                    KAxis_XLine_color:"rgb(155, 192, 227)",//坐标轴X轴虚线颜色
                    KAxis_YLine_color:"rgb(155, 192, 227)",//坐标轴Y轴虚线颜色
                    KAxis_AxisLine_bg:"rgb(125, 162, 197)",//坐标轴边界___|的颜色
                    KAxis_price_text_font:"",//左上角价格文字字体
                    KAxis_price_text_color:"black",//左上角价格文字颜色

                    Candle_line_color:"rgb(216, 146, 144)",//蜡烛中间线颜色
                    Candle_up_bg:"rgb(194, 53, 49)",//蜡烛价格上升背景
                    Candle_down_bg:"rgb(49, 70, 86)",//蜡烛价格下降背景

                    CrossLine_line_color:"red",//十字线线条颜色
                    CrossLine_rect_bg:"#34495e",//十字线时间、价格矩形背景色
                    CrossLine_rect_color:"#FFFFFF",//十字线时间、价格文字颜色
                    CrossLine_rect_font:"",//十字线时间、价格文字字体
                    CrossLine_tip_bg:"#34495e",//十字线提示框背景色
                    CrossLine_tip_color:"#FFFFFF",//十字线提示框字体颜色
                    CrossLine_tip_font:"",//十字线提示框字体

                    AssistLine_line_color:"",//辅助线颜色
                    AssistLine_line_width:2,//辅助线宽度

                    FibonacciLine_line_color:"blue",//黄金分割线颜色
                    FibonacciLine_text_color:"blue",//黄金分割线字体颜色

                    PriceLine_line_color:"#34495e",//价格线颜色
                    PriceLine_rect_color:"#FFFFFF",//价格线文字颜色
                    PriceLine_rect_bg:"#34495e",//价格线矩矩形背景色
                    PriceLine_rect_font:""//价格线文字字体

               };
               
            }
        };
        return Theme;
    }
);
