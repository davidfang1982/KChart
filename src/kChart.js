define(
        ['zrender',
         'zrender/kChart/Theme',
         'zrender/kChart/CrossLine',
         'zrender/kChart/Quota',
         'zrender/kChart/AssistLine',
         'zrender/kChart/FibonacciLine',
         'zrender/kChart/PriceLine',
         'zrender/kChart/Candle',
         'zrender/kChart/KAxis',
         'zrender/kChart/CandleQueue',
         'zrender/kChart/CandlePainter'],

        function(zrender) {
            var Theme = require('zrender/kChart/Theme');
            var Candle = require('zrender/kChart/Candle');
            var KAxis = require('zrender/kChart/KAxis');
            var PriceLine = require('zrender/kChart/PriceLine');
            var CrossLine = require('zrender/kChart/CrossLine');
            var AssistLine = require('zrender/kChart/AssistLine');
            var Quota = require('zrender/kChart/Quota');
            var FibonacciLine = require('zrender/kChart/FibonacciLine');
            var CandleQueue = require('zrender/kChart/CandleQueue');
            var Group = require('zrender/Group');
            var CandlePainter = require('zrender/kChart/CandlePainter');
            var quota;
            var kchart={};
            var moveDirect=false,animationSize=10;
            //初始化
        	kchart.init=function(id,options){
                var offsetX,zrenderX,current=this;
                this.id=id;
                this.assistLineIndex=0;
                this.fibonacciLineIndex=0;
                var zr=this.zr= zrender.init(document.getElementById(id));
                //设置样式
                this.theme=new Theme(zr);
                this.theme.fill(options.theme);
                //配置对象 用于
                var config=this.config={
                    crossLineOpen:false,
                    assistLineMove:false,
                    moveflag:false
                };
                //1.创建坐标系
                var kAxis=this.kAxis=new KAxis({
                    invisible:false,
                    style : {
                        zrWidth : zr.getWidth(),
                        zrHeight : zr.getHeight(),
                        width : 50,
                        height : 30,
                        strokeColor : '#000000'
                    },
                    draggable:false
                },zr);

                //2.坐标轴层
                var axisGroup = new Group();
                axisGroup.addChild(kAxis);
                axisGroup.draggable=false;
                axisGroup.zlevel=0;
                kAxis.setAxisGroup(axisGroup);
            
                //3.K线图层
                var chartGroup = new Group();
                chartGroup.draggable=true;
                chartGroup.panable=true;          

                //1.先设置初始数据
                var candleQueue=this.candleQueue=new CandleQueue(options.dataType, options.data);
            
                //2.创建CandlePainter对象
                var candlePainter=this.candlePainter=new CandlePainter(chartGroup,zr,kAxis,candleQueue);
                candlePainter.setStep(options.step||3);
                candlePainter.paint();
        
                //添加图表和轴线
                zr.addGroup(chartGroup);
                zr.addGroup(axisGroup);

                zr.render();
            
                var mobile=/mobile|tablet|ip(ad|hone|od)|android|silk/i.test(window.navigator.userAgent);
                if(!mobile){
                    zr.on("mousedown",function(param){
                        if(config.crossLineOpen){
                            current.crossLineChange(param.event.layerX||param.event.x||param.event.zrenderX,
                                param.event.layerY||param.event.x||param.event.zrenderY);
                            return;//不能移动
                        }
                        if(config.assistLineMove){
                            config.moveflag=false;
                            return;
                        }
                        config.moveflag=true;
                        offsetX=param.event.offsetX;
                        zrenderX=param.event.zrenderX;
                        $("#"+id+">div").css("cursor","col-resize");
                    });
                    zr.on("mousemove",function(param){
                        if(config.crossLineOpen||config.assistLineMove)return;//不能移动
                        if(config.moveflag){
                            var movement=param.event.movementX;
                            movement=(movement==undefined||isNaN(movement))?(param.event.offsetX-offsetX):movement;
                            movement=(movement==undefined||isNaN(movement))?(param.event.zrenderX-zrenderX):movement;
                            var flag=candlePainter.translate(movement);
                            
                            zrenderX=param.event.zrenderX;
                            offsetX=param.event.offsetX;
                            flag||zr.render();
                        }
                    });
                
                    zr.on("mouseup",function(param){
                        if(config.crossLineOpen||config.assistLineMove)return;//不能移动
                        //setTimeout(kchart.animation,100);
                        config.moveflag=false;
                        $("#"+id+">div").css("cursor","");
                    });
                }else{
                    var myElement = document.getElementById(id);
                    if(!window.Hammer){
                        return;
                    }
                    //需要引入Hammer.js
                    var hammertime = new Hammer(myElement);
                    hammertime.add(new Hammer.Pinch());
                    hammertime.on('swipe', function(ev) {
                        kchart.swipe(ev.deltaX);//滑动
                    });
                    var scale=100;
                    hammertime.on('pinchend', function(ev) {
                        scale=100;//初始是100
                    });
                    hammertime.on('pinchmove', function(ev) {
                        var tmp=Math.round(ev.scale*100);
                        var flag=ev.scale>1?1:0;
                        var seg=tmp%100;
                        //kchart._debug(flag+"mv"+(tmp-scale));
                        if(Math.abs(tmp-scale)>10){
                            kchart.scale(tmp-scale);
                            scale=tmp;
                        }
                    });
                    var panX=0;
                    hammertime.on('panstart', function(ev) {
                        panX=0;
                    });
                    hammertime.on('pan', function(ev) {
                        kchart.pan(ev.deltaX-panX);
                        panX=ev.deltaX;
                    });
                    hammertime.on('tap', function(ev) {
                        //console.log(ev.center.x,ev.center.y);
                        kchart.crossLineChange(ev.center.x,ev.center.y);
                    });
                }

            };

            kchart.pan=function(movement){
                if(this.config.crossLineOpen||this.config.assistLineMove)return;//不能移动
                var flag=kchart.candlePainter.translate(movement);
                flag||kchart.zr.render();
            },

            kchart.swipe=function(x){
                if(this.config.crossLineOpen||this.config.assistLineMove)return;//不能移动
                animationSize=x*2;//偏移长度
                (x>0)?(moveDirect=true):(moveDirect=false);//偏移方向,moveDirect 122=true=右移
                setTimeout(kchart.animation);
            },
            kchart.animation=function(){
                var per=(moveDirect?-1:1);
                var size=animationSize+(20*per);
                if((moveDirect&&size<=0)||(!moveDirect&&size>=0)){
                    return;
                }
                animationSize=size;
                var flag=kchart.candlePainter.translate(20*-per);
                flag||kchart.zr.render();
                setTimeout(kchart.animation);
            },
            //设置十字线的位置
            kchart.crossLineChange=function(x,y){
                if(!this.config.crossLineOpen)return;
                var crossLine=this.zr.storage.get("crossLine");
                //获取十字线吸附状态
                var ret=this.candlePainter.adsorb(x,y,true);
                //计算x轴和y轴显示内容
                //设置十字线状态
                crossLine.buildPath({
                    x:ret.x,
                    y:ret.y,
                    candleData:this.candleQueue.get(ret.index),
                    price:ret.price,
                    time:ret.time,
                    index:ret.index});
                    crossLine.__dirty=true;
                    this.zr.render();
            };
            //设置辅助线
            kchart.assistLine=function(){
                var assistLine = new AssistLine({
                    id:"assistLine"+this.assistLineIndex,
                    style: {
                        index:this.assistLineIndex,
                        chartGroup:true,
                        xStart: 100,
                        yStart: 100,
                        xEnd: 200,
                        yEnd: 200
                    }
                },this.zr,this.config);
                this.assistLineIndex++;
                this.zr.addGroup(assistLine);
                this.config.assistLineMove=false;
                this.zr.render();   
            },
            //删除辅助线
            kchart.deleteAssistLine=function(){
                for (; this.assistLineIndex >= 1; this.assistLineIndex--) {
                    var line=this.zr.storage.get("assistLine"+(this.assistLineIndex-1));
                    if(line){
                        line.dispose();
                        this.zr.delGroup(line.id);
                    }
                };
                this.zr.render();
            };
            //添加黄金分割线
            kchart.addGoldLine=function(){
                var fibonacciLine = new FibonacciLine({
                    id:"fibonacciLine"+this.fibonacciLineIndex,
                    style: {
                        index:this.fibonacciLineIndex,
                        xStart: 100,
                        yStart: 100,
                        xEnd: 200,
                        yEnd: 200
                    }
                },this.zr,this.config);
                this.fibonacciLineIndex++;
                this.zr.addGroup(fibonacciLine);
                this.config.assistLineMove=false;
                this.zr.render();
            };
            kchart.delGoldLine=function(){
                for (; this.fibonacciLineIndex >= 1; this.fibonacciLineIndex--) {
                    var line=this.zr.storage.get("fibonacciLine"+(this.fibonacciLineIndex-1));
                    if(line){
                        line.disposeF();
                        this.zr.delGroup(line.id);
                    }
                };
                this.zr.render();
            };
            //更新
            kchart.update=function(data,index){
                index=index||0;
                this.candlePainter.update(data,index);
                this.zr.render();
            };
            //缩放
            kchart.scale=function(index){
                if(index>0)
                    this.candlePainter.less();//放大
                else
                    this.candlePainter.more();
                this.zr.render();
            },
            //平移
            kchart.move=function(index){
                this.candlePainter.translate(index);
                this.zr.render();
            },
            //价格线
            kchart.priceLine=function(show){
                var priceLine=this.zr.storage.get("priceLine");
                if(show){
                    if(priceLine){
                        priceLine.show();
                        return;
                    }
                    priceLine = new PriceLine({
                        id:"priceLine",
                        style: {
                            lineWidth:this.zr.getWidth()-this.kAxis.getWidth(),
                            rectWidth:this.kAxis.getWidth(),
                            rectHeight:20,
                            rectColor:'cyan'
                        }
                    },this.zr);
                    this.zr.addGroup(priceLine);
                    this.zr.render();
                }else{
                    //目前只是隐藏，安全删除需要于移除事件，delete对象，从zrstroge删除等操作
                    priceLine.hide();
                    this.zr.refresh();
                }
            },
            //添加十字线
            kchart.crossLine=function(show){
                var crossLine=this.zr.storage.get("crossLine");
                if(show){
                    if(crossLine){
                        this.config.crossLineOpen=true;
                        crossLine.show();
                        this.crossLineChange(crossLine.style.lineWidth/2,crossLine.style.lineHeight/2);
                        return;   
                    }
                    //创建十字线
                    crossLine = new CrossLine({
                        id:"crossLine",
                        style: {
                            x:50,
                            y:50,
                            lineWidth:this.zr.getWidth()-this.kAxis.getWidth(),
                            lineHeight:this.zr.getHeight()-this.kAxis.getHeight(),
                            rectWidth:this.kAxis.getWidth(),
                            rectHeight:20,
                            tipRectWidth:80,
                            tipRectHeight:50
                        }
                    },this.zr);
                    this.config.crossLineOpen=true;//不能移动
                    this.zr.addGroup(crossLine);
                    this.crossLineChange(crossLine.style.lineWidth/2,crossLine.style.lineHeight/2);
                }else{
                    crossLine.hide();
                    this.zr.render();
                    this.config.crossLineOpen=false;
                }
            },
            kchart._debug=function(txt){
                this.candlePainter._debug(txt);
                this.zr.render();
            },
            //添加指标
            kchart.quota=function(){
                    if(quota)return;
                    quota=new Quota(this.zr);
                    this.zr.render();
            },
            //删除指标
            kchart.delQuota=function(){
                    quota.dispose();
                    quota=undefined;
                    this.zr.render();
            };
        	return kchart; 
        }
    );
