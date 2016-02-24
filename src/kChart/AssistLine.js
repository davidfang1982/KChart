
define(function (require) {
        var Group = require('../Group');
        var CircleShape = require('../shape/Circle');
        var LineShape = require('../shape/Line');
        var configRef;
        var oldConfig={},chartGroup;
        
        var AssistLine = function (options,zr,config) {
            Group.call(this, options);
            this.zr=zr;
            //this.init=false;
            configRef=config;//传入一个配置对象，用于设置平移、十字线等互斥关系
            chartGroup=this.chartGroup=zr.storage.get('chartGroup');
            this.drift=chartGroup.cPainter.getDrift();//获取偏移位置
            this.buildPath(options.style);
            chartGroup.cPainter.onPaint(this);
            chartGroup.cPainter.onScale(this);
            this.pName=options.pName||"";
            //this.moveWindow=options.moveWindow||false;
        };

        //计算中点位置
        function _midPointLoc(xStart,xEnd,yStart,yEnd,posStart,posEnd){
                var ret={};
                posStart=posStart||[0,0];
                posEnd=posEnd||[0,0];
                xStart+=posStart[0];
                xEnd+=posEnd[0];
                yStart+=posStart[1];
                yEnd+=posEnd[1];
                ret.x=xStart+(xEnd-xStart)/2;
                ret.y=yStart+(yEnd-yStart)/2;
                return ret;
        }

        AssistLine.prototype =  {
            type: 'assistLine',
            clickable : true,
            _fixLocation:function(xStart,yStart,xEnd,yEnd){
                //判断
            },
            whenScale:function(){
                if(!this._storage)return;//被删除了
                //console.log(chartGroup.cPainter.candleWidth+" "+this.candleWidth);
                var beginX=chartGroup.cPainter.getXPx(this.candleBeg),
                endX=chartGroup.cPainter.getXPx(this.candleEnd),
                beginPoint=this.pointBegin,
                endPoint=this.pointEnd;
                //current.candleBeg current.candleEnd
                //计算位置
                beginPoint.style.x=beginX;
                endPoint.style.x=endX;
                beginPoint.modSelf();
                endPoint.modSelf();

                //计算中间点，设置位置
                var midLoc=_midPointLoc(beginPoint.style.x,
                                        endPoint.style.x,
                                        beginPoint.style.y,
                                        endPoint.style.y);
                this.pointMid.style.x=midLoc.x;
                this.pointMid.style.y=midLoc.y;
                this.pointMid.modSelf();

                //设置直线位置
                this.line.style.xStart=beginX;
                this.line.style.xEnd=endX;

                //每次设置直线的
                this.lineXSOri=beginX;
                this.lineXEOri=endX;

                this.buildLines();

            },
            //平移重绘时直线回调函数。
            whenPaint:function(a){
                if(!this._storage)return;//被删除了

                //计算一下最新的y值，并设置起始/结束点
                var yb=chartGroup.cPainter.getYPx(this.priceBeg);
                var ye=chartGroup.cPainter.getYPx(this.priceEnd);
                this.pointBegin.style.y=yb;
                this.pointEnd.style.y=ye;
                this.pointBegin.modSelf();
                this.pointEnd.modSelf();

                //计算中间点，设置位置
                var midLoc=_midPointLoc(this.pointBegin.style.x,
                                        this.pointEnd.style.x,
                                        this.pointBegin.style.y,
                                        this.pointEnd.style.y);
                this.pointMid.style.y=midLoc.y;
                this.pointMid.modSelf();

                //设置直线位置
                this.line.style.yStart=yb;
                this.line.style.yEnd=ye;

                //每次设置直线的
                this.lineYSOri=yb;
                this.lineYEOri=ye;

                this.buildLines();
            },
            //删除时
            dispose:function(){
                chartGroup.removeChild(this.pointBegin);
                chartGroup.removeChild(this.pointEnd);
                chartGroup.removeChild(this.pointMid);
                chartGroup.removeChild(this.line);
            },
            buildPath : function (style) {
                var zr=this.zr;
                var dragging;//记录正在拖动的点
                //this.candleWidth=chartGroup.cPainter.candleWidth;
                //初始化时，根据给定的线段位置（相对于canvas的坐标）获取吸附值，
                //返回的坐标也相对于canvas
                var ret=chartGroup.cPainter.adsorbExt(style.xStart,style.yStart);//获取吸附后的坐标
                style.xStart=ret.x;
                style.yStart=ret.y;
                style.bIndex=ret.index;
                ret=chartGroup.cPainter.adsorbExt(style.xEnd,style.yEnd);//获取吸附后的坐标
                style.xEnd=ret.x;
                style.yEnd=ret.y;
                style.eIndex=ret.index;
                //计算middle点的坐标
                var midLoc=_midPointLoc(style.xStart,style.xEnd,style.yStart,style.yEnd);

                //创建点
                var pointBegin=this.pointBegin=this._create(style.xStart,style.yStart,'B',style.index);
                var pointEnd=this.pointEnd=this._create(style.xEnd,style.yEnd,'E',style.index);
                var pointMid=this.pointMid=this._create(midLoc.x,midLoc.y,'M',style.index);
                
                var current=this;
                //这四个数据记录移动时的原始位置，设置line的值时都应该设置Ori
                current.lineXSOri=style.xStart;
                current.lineYSOri=style.yStart;
                current.lineXEOri=style.xEnd;
                current.lineYEOri=style.yEnd;
                //记录起始，结束的价格
                current.priceBeg=chartGroup.cPainter.getPrice(current.lineYSOri),
                current.priceEnd=chartGroup.cPainter.getPrice(current.lineYEOri);
                //记录当前的candle值
                current.candleBeg=style.bIndex;
                current.candleEnd=style.eIndex;

                //创建直线
                var line=this.line=new LineShape({
                    id:"assistCenterLine"+style.index,
                    style:{
                        xStart: style.xStart,
                        yStart: style.yStart,
                        xEnd: style.xEnd,
                        yEnd: style.yEnd,
                        strokeColor: style.tipRectColor||'blue',
                        lineWidth: 1,
                        lineCape:"round"
                    }
                });
                this.line.zlevel=2;
                if(true){//若需要放在chartGroup上
                    chartGroup.addChild(this.line);
                    chartGroup.addChild(this.pointBegin);
                    chartGroup.addChild(this.pointEnd);
                    chartGroup.addChild(this.pointMid);
                }else{//此处不会执行，若不随图表移动，放在本group上
                    this.addChild(this.line);
                    this.addChild(this.pointBegin);
                    this.addChild(this.pointEnd);
                    this.addChild(this.pointMid);
                }

                this.zr.on("mousemove",function(e){
                    if(dragging!==pointMid&&dragging!==pointBegin&&dragging!==pointEnd)
                        return;
                    //若为起始点
                    if(dragging===pointBegin||dragging===pointEnd){
                        //距离canvas的距离
                        var x=e.event.offsetX||e.event.zrenderX;
                        var y=e.event.offsetY||e.event.zrenderY;

                        var drift=0;//painter的偏移量
                        var ret={x:0,y:0};//记录吸附后计算的坐标
                        ret=chartGroup.cPainter.adsorb(x,y);//获取吸附后的坐标
                        
                        if(true){//跟随平移
                            drift=chartGroup.cPainter.getDrift();
                        }
                        x=ret.x;
                        y=ret.y;
                        //设置当前移动点的偏移量
                        dragging.position[0]=ret.x-dragging.style.x-drift;
                        dragging.position[1]=ret.y-dragging.style.y;
                        
                        //起始点
                        if(dragging.style.text.charAt(0)=='B'){
                            current.lineXSOri=line.style.xStart=x-drift-line.position[0];
                            current.lineYSOri=line.style.yStart=y-line.position[1];
                            current.candleBeg=ret.index;
                        }else{
                            current.lineXEOri=line.style.xEnd=x-drift-line.position[0];
                            current.lineYEOri=line.style.yEnd=y-line.position[1];
                            current.candleEnd=ret.index;
                        }

                        //计算中点位置
                        var midLoc=_midPointLoc(pointBegin.style.x,pointEnd.style.x,
                            pointBegin.style.y,pointEnd.style.y,pointBegin.position,pointEnd.position);
                        pointMid.position[0]=midLoc.x-pointMid.style.x;
                        pointMid.position[1]=midLoc.y-pointMid.style.y;
                        
                    }else if(dragging===pointMid){//中点移动
                        var x=e.event.offsetX||e.event.zrenderX;
                        var y=e.event.offsetY||e.event.zrenderY;
                        var drift=0;//偏移量
                        if(true){
                            drift=chartGroup.cPainter.getDrift();
                            //console.log("drift "+drift);
                        }
                        //计算move距离
                        var retX=x-pointMid.style.x-drift;
                        var retY=y-pointMid.style.y;
                        
                        //设置直线位置
                        line.style.xStart=current.lineXSOri+retX;
                        line.style.yStart=current.lineYSOri+retY;
                        line.style.xEnd=current.lineXEOri+retX;
                        line.style.yEnd=current.lineYEOri+retY;

                        

                        //设置起始结束点位置
                        pointBegin.style.x=line.style.xStart;
                        pointBegin.style.y=line.style.yStart;
                        pointBegin.modSelf();
                        pointEnd.style.x=line.style.xEnd;
                        pointEnd.style.y=line.style.yEnd;
                        pointEnd.modSelf();
                        
                    }
                        current.buildLines();
                        zr.render();
                        if(dragging===pointMid)return;

                        //显示移动框
                        var _rx,_ry,_rx1,_ry1,//分别为读取chart和line的起始坐标
                        _outx=10,_outy=10,//
                        devicePixelRatio=window.devicePixelRatio||1,
                        _width=chartGroup.cPainter.pWidth,
                        rect=Math.min(_width,chartGroup.cPainter.pHeight)/5;//读取的范围
                        if(e.event.zrenderX!==undefined){//移动端
                            _rx=(x)-rect/2;
                            _ry=(y)-rect/2;
                            _rx=Math.round(_rx);
                            _ry=Math.round(_ry);
                            _rx1=_rx;
                            _ry1=_ry-line.position[1];
                            _width=_width*devicePixelRatio;
                            rect=rect*devicePixelRatio;
                            _rx1=_rx=_rx*devicePixelRatio;
                            _ry=_ry*devicePixelRatio;
                            _ry1=_ry1*devicePixelRatio;
                        }else{//非移动端
                            _rx=_rx1=dragging.style.x+dragging.position[0]-rect/2+drift;
                            _ry=_ry1=dragging.style.y+dragging.position[1]-rect/2;
                        }

                        if(_rx<=rect*1.2&&_ry<=rect*1.2){//移动到左上角，切换到右上角显示
                            _outx=(_width-rect)-10;
                        }
                        
                        var ctx=zr.painter.getLayers()[1].ctx;
                        var imgData=ctx.getImageData(_rx,_ry,rect,rect);
                        ctx.putImageData(imgData,_outx,_outy);

                        ctx=zr.painter.getLayers()[2].ctx;
                        imgData=ctx.getImageData(_rx1,_ry1,rect,rect);
                        ctx.putImageData(imgData,_outx,_outy);
                       
                });

                this.zr.on("dragend",function(e){
                        //若
                       if(dragging!==pointMid&&dragging!==pointBegin&&dragging!==pointEnd)
                            return;
                       
                        configRef.assistLineFlag=false;
                        configRef.moveflag=false;
                        
                        //拖得结束，恢复crossLineOpen配置
                        configRef.crossLineOpen=oldConfig.crossLineOpen;
                        var drift=0;
                        drift=chartGroup.cPainter.getDrift();
                        //拖动结束，设置当前点位置，偏移量设置为0
                        dragging.style.x+=dragging.position[0];
                        dragging.style.y+=dragging.position[1];
                        dragging.modSelf();
                        dragging.position[0]=0;
                        dragging.position[1]=0;

                        if(dragging!==pointMid){//不为中点，才设置中点位置,设置后为什么不能选中了啊...
                            pointMid.style.x+=pointMid.position[0];
                            pointMid.style.y+=pointMid.position[1];
                            pointMid.modSelf();
                            pointMid.position[0]=0;
                            pointMid.position[1]=0;
                        }else{
                            //中点放下时，需要计算吸附
                            //根据坐标计算
                            var ret=chartGroup.cPainter.adsorbExt(line.style.xStart,undefined,false,true);
                            line.style.xStart=ret.x;
                            current.candleBeg=ret.index;
                            ret=chartGroup.cPainter.adsorbExt(line.style.xEnd,undefined,false,true);
                            line.style.xEnd=ret.x;
                            current.candleEnd=ret.index;

                            //设置中点
                            var midLoc=_midPointLoc(line.style.xStart,line.style.xEnd,line.style.yStart,line.style.yEnd);
                            pointMid.style.x=midLoc.x;
                            pointMid.style.y=midLoc.y;
                            pointMid.modSelf();
                            //
                            pointBegin.style.x=line.style.xStart;
                            pointEnd.style.x=line.style.xEnd;
                            pointBegin.modSelf();
                            pointEnd.modSelf();
                            
                        }
                        
                        //放下时，记录直线的值
                        current.lineXSOri=line.style.xStart;
                        current.lineXEOri=line.style.xEnd;
                        current.lineYSOri=line.style.yStart;
                        current.lineYEOri=line.style.yEnd;
                        //及其价格
                        current.priceBeg=chartGroup.cPainter.getPrice(current.lineYSOri);
                        current.priceEnd=chartGroup.cPainter.getPrice(current.lineYEOri);

                        dragging=undefined;
                        current.buildLines();
                        zr.render();
                    });

                this.zr.on("dragstart",function(e){
                        dragging=e.target;
                        configRef.assistLineFlag=true;
                        configRef.moveflag=false;
                });
                this.buildLines();
            },
            buildLines:function(){
            },
            _create:function(x,y,text,index){
                var pointBegin= new CircleShape({
                    id:"point"+this.pName+text+index,
                    style : {
                        x : x,
                        y : y,
                        r : 20,
                        brushType : 'both',
                        color : 'rgba(0, 0, 0, 0)',          // rgba supported
                        strokeColor : 'red',  // getColor from default palette
                        lineWidth : 0,
                        text :text+index,
                        textPosition :'top'
                    },
                    highlightStyle:{
                        lineWidth : 0,
                    },
                    hoverable : true,   // default true
                    draggable : true,   // default false
                    clickable : true,   // default false
                   
                    /* 封装支持事件，见shape/base, config.EVENT*/
                    //onmousemove : function(e){console.log('onmousemove',e)},
                    //onmouseover : function(e){console.log('onmouseover',e)},
                    //onmouseout  : function(e){console.log('onmouseout',e)},
                    onmousedown : function(e){
                        console.log('onmousedown',e);
                        //e.event.stopPropagation();
                        //e.cancelBubble=true;

                        //保存原先配置
                        oldConfig.crossLineOpen=configRef.crossLineOpen;
                        //不能修改十字线配置
                        configRef.crossLineOpen=false;
                    },
                    //onmouseup   : function(e){console.log('onmouseup',e)},
                    
                    
                    ondragenter : function(e){console.log('ondragenter',e);},
                    ondragover  : function(e){console.log('ondragover',e);},
                    ondragleave : function(e){console.log('ondragleave',e);},
                    ondrop      : function(e){console.log('ondrop');}
                    
                });
                pointBegin.zlevel=2;  
                return pointBegin;  
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

        require('../tool/util').inherits(AssistLine, Group);
        return AssistLine;
    }
);
