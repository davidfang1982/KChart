

define(
    function (require) {
        var Base = require('../shape/Base');
        var LineShape = require('../shape/Line');
        var Text = require('../shape/Text');
        var theme;
        var KAxis = function (options,zr) {
            Base.call(this, options);
            this.zr=zr;
            this.ySpan=100;//y轴间隔npx绘制横线
            this.xSpan=3;//x轴间隔n个蜡烛图绘制竖线
            this._color="gray";
            this.textXSpan=10;//x轴文字距离线的距离
            this.textYSpan=5;//y轴文字距离线的距离
            this.zlevel=2;
            this.xLineSpan=0;//x轴线之间的距离
            this.showPrice=true;//默认在左上角显示价格文字
            theme=this.zr.theme;
        };

        KAxis.prototype =  {
            type: 'kAxis',
            setAxisGroup:function(axisGroup){
                this.axisGroup=axisGroup;
            },
            buildPath : function (ctx, style) {
                //style.zrWidth
                //style.zrHeight
                //style.height
                //style.width
                style.brushType="stroke";
                this.hoverable=false;
                style.radius=style.radius||3;//默认3px
                
                //绘制坐标轴的线段 ____|
                ctx.moveTo(0, style.zrHeight-style.height);
                ctx.lineTo(style.zrWidth-style.width,style.zrHeight-style.height);
                ctx.lineWidth=5;
                ctx.lineTo(style.zrWidth-style.width,0);
                ctx.strokeStyle=theme.KAxis_AxisLine_bg||'#8f0000';
                ctx.stroke();

                //填充展现数据的两个矩形，在移动时覆盖移出的图表
                ctx.fillStyle=theme.KAxis_X_bg||"black";
                ctx.fillRect(0, style.zrHeight-style.height,style.zrWidth,style.height);
                ctx.fillStyle=theme.KAxis_Y_bg||"black";
                ctx.fillRect(style.zrWidth-style.width,0,style.width,style.zrHeight);

                //if(!style.priceLine)return;
                ctx.beginPath();
                ctx.moveTo(0,style.priceLineY);
                ctx.lineTo(style.zrWidth-style.width,style.priceLineY);
                ctx.lineWidth='1';
                ctx.strokeStyle='#ffffff';
                ctx.stroke();
                ctx.fillStyle="orangered";
                ctx.fillRect(style.zrWidth-style.width,style.priceLineY-10,style.width-10,30);
               
                if(!this.priceText){
                    this.priceText= new Text({
                            hoverable:false,
                            style: {
                                text:"",
                                x: 10,
                                y: 0,
                                color:theme.KAxis_price_text_color||'#FFF',
                                textBaseline:'top',
                                textFont: theme.KAxis_price_text_font||'14px Arial'
                            }
                     });
                    this.priceText.zlevel=2;
                    this.axisGroup.addChild(this.priceText);
                }else{
                    //this.priceText.style.text=style.priceText||"EURUSD,M1,1.09322 1.09324 1.09314 1.09318";
                }
            },
            refreshPriceText:function(data,prefix){
                if(!this.showPrice)return;
                this.priceText.style.text=prefix+','+data[0]+" "+
                    data[1]+" "+
                    data[2]+" "+data[3];
            },
            //
            //创建文字
            _createText:function(x,y,cnt,idNo){
                var text = new Text({
                        style: {
                            text:cnt,
                            x: x,
                            y: y,
                            color:theme.KAxis_text_color||'white',
                            textFont: theme.KAxis_text_font||'12px Arial'
                        }
                    });
                if(idNo!==undefined){
                    text.id=idNo;
                }
                text.zlevel=2;
                return text;
            },
            //创建X轴线
            _createXLine:function(j,x,cPaint){
                //初始化，创建直线
                var shape = new LineShape({
                    id:"xAxisLine"+j,
                    style: {
                        xStart: x,
                        yStart: 0,
                        xEnd: x,
                        yEnd: cPaint.pHeight,
                        strokeColor: theme.KAxis_XLine_color||'#ff0000',
                        lineWidth: 1,
                        lineType:'dashed'
                    }
                });
                shape.hoverable=false;
                this.axisGroup.addChild(shape);
                return shape;
            },
            //创建X轴的文字
            _createXText:function(j,x,cPaint){
                var text=this._createText(x-20,cPaint.pHeight+this.textXSpan,this._getXAxisShow(cPaint,j,this.xSpan),"xText"+j);
                this.axisGroup.addChild(text);
                return text;
            },
            //绘制X轴的内容,左右两边都要多一个x轴，因为如果两边都只差一点时，移动时不能移出头或尾
            _refreshX:function(cPaint){
                var max=cPaint.pWidth+this.xLineSpan;
                //属性x轴左边半段
                for(var x=this.xExcess,j=0;x<max;x+=this.xLineSpan,j++){
                    var tmp=this.zr.storage.get("xAxisLine"+j);
                    if(!tmp){
                        tmp=this._createXLine(j,x,cPaint);
                    }else{
                        tmp.style.xStart=x;
                        tmp.style.xEnd=x;
                    }
                    
                    tmp=this.zr.storage.get("xText"+j);
                    if(!tmp){
                        tmp=this._createXText(j,x,cPaint);
                    }else{
                        tmp.style.x=x-20;
                        tmp.style.text=this._getXAxisShow(cPaint,j,this.xSpan);
                    }
                    //不显示
                    if(x+this.xLineSpan>=max){
                        tmp.style.text="";
                    }
                }

                
                
            },

            _createYLine:function(j,y,cPaint){
                var shape = new LineShape({
                    id:"yAxisLine"+j,
                    style: {
                        xStart: 0,
                        yStart: y,
                        xEnd: cPaint.pWidth,
                        yEnd: y,
                        strokeColor: theme.KAxis_YLine_color||'cyan',
                        lineWidth: 0.5,
                        lineType:'dashed'
                        
                    }
                });
                this.axisGroup.addChild(shape);
                return shape;
            },
            //创建y轴文字
            _createYText:function(j,y,cPaint){
                var text=this._createText(cPaint.pWidth+this.textYSpan,y,(cPaint.ymax-(y*cPaint.PPYP)).toFixed(2),"yText"+j);
                this.axisGroup.addChild(text);
            },
            //刷新Y轴，刷新前要设置好y轴的数据
            refreshY:function(cPaint){
                //刷新y轴
                for(var y=10,j=0;y<cPaint.pHeight;y+=this.ySpan,j++){
                    var tmp=this.zr.storage.get("yAxisLine"+j);
                    if(!tmp){
                        this._createYLine(j,y,cPaint);
                    }
                    tmp=this.zr.storage.get("yText"+j);
                    if(!tmp){
                        tmp=this._createYText(j,y,cPaint);
                    }else{
                        tmp.style.text=(cPaint.ymax-(y*cPaint.PPYP)).toFixed(2);
                    }
                }
            },
            _getXAxisShow:function(cPaint,j,xSpan){
                    j=j-this.xTextExcess;
                    return cPaint.candleQueue.creaseDate(j*xSpan);
            },
            
            //刷新x轴，平移时主要是根据偏移量drift来计算的位置
            refreshX:function(cPaint,movement,refresh){
                if(movement!==undefined){
                    if(movement===0&&!refresh)return;
                    //平移时，根据偏移量计算x轴左边偏移的部分，根据此变量重新绘制x轴竖线
                    this.xExcess=this.xExcessInit+(cPaint.drift%this.xLineSpan);
                    //平移时，根据偏移量计算文字偏移
                    this.xTextExcess=this.xTextExcessInit+parseInt((cPaint.drift)/this.xLineSpan,10);
                    //现有的开始移动
                    //console.log(this.xTextExcess);
                }else{//首次刷新，movement为undefined
                    //计算x轴线之间的距离，单位px
                    this.xLineSpan=cPaint.candleWidth*this.xSpan;
                    //左边第一个x轴线，负值
                    this.xExcess=(cPaint.xBegin%this.xLineSpan)-this.xLineSpan;
                    //初始时x轴左边多出的部分
                    this.xExcessInit=this.xExcess;
                    //文字偏移
                    this.xTextExcess=parseInt(cPaint.xBegin/this.xLineSpan,10)+1;
                    //
                    this.xTextExcessInit=this.xTextExcess;
                }
                this._refreshX(cPaint);
            },
            
            getHeight:function(){
                return this.style.height||0;
            },
            getWidth:function(){
                return this.style.width||0;
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
                    y : style.x - style.rTop,
                    width : style.radius*2,//style.width + lineWidth,
                    height : Math.max(style.top,style.rTop)+Math.max(style.bottom,style.rBottom)//style.height + lineWidth
                };
                
                return style.__rect;
            }
        };

        require('../tool/util').inherits(KAxis, Base);
        return KAxis;
    }
);
