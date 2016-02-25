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

        	function init(id,options){
            var zr = zrender.init(document.getElementById(id));
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
            //设置样式
            new Theme(zr).fill(options.theme);
            
            //配置对象 用于
            var config={
                crossLineOpen:false,
                assistLineMove:false,
                moveflag:false
            };
            //创建坐标系
            var kAxis=new KAxis({
                invisible:false,
                style : {
                    zrWidth : zr.getWidth(),
                    zrHeight : zr.getHeight(),
                    width : 80,
                    height : 30,
                    strokeColor : '#000000'
                },
                draggable:false
            },zr);

            //坐标轴层
            var axisGroup = new Group();
            axisGroup.addChild(kAxis);
            axisGroup.draggable=false;
            axisGroup.zlevel=0;
            kAxis.setAxisGroup(axisGroup);

            //辅助线
            //var auxiliaryGroup = new Group();
            

            
            //K线图层
            var chartGroup = new Group();
            chartGroup.draggable=true;
            chartGroup.panable=true;          

            //1.先设置初始数据
            var candleQueue=new CandleQueue(options.dataType, options.data);
            
            //2.创建CandlePainter对象
            var candlePainter=new CandlePainter(chartGroup,zr,kAxis,candleQueue);
            candlePainter.setStep(3);
            candlePainter.paint();
        
            //添加图表和轴线
            zr.addGroup(chartGroup);
            zr.addGroup(axisGroup);

            
            //3
            //创建辅助线
            
            zr.render();


            //setTimeout(update,1000);
            
            var offsetX,zrenderX;
            zr.on("mousedown",function(param){
                if(config.crossLineOpen){
                    crossLineChange(param.event.layerX||param.event.x||param.event.zrenderX,
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
                $("#main>div").css("cursor","col-resize");
            });
            zr.on("mousemove",function(param){
                //console.log("mousemove..."+(param.event.zrenderX-zrenderX));
                if(config.crossLineOpen||config.assistLineMove)return;//不能移动
                
                if(config.moveflag){
                    //console.log(param.event.zrenderX);
                    var movement=param.event.movementX;
                    movement=(movement==undefined||isNaN(movement))?(param.event.offsetX-offsetX):movement;
                    movement=(movement==undefined||isNaN(movement))?(param.event.zrenderX-zrenderX):movement;
                    var flag=candlePainter.translate(movement);
                    zrenderX=param.event.zrenderX;
                    offsetX=param.event.offsetX;
                    flag||zr.render();
                }
            });
            zr.on("drag",function(param){

            });
            zr.on("mouseup",function(param){
                if(config.crossLineOpen||config.assistLineMove)return;//不能移动
                config.moveflag=false;
                $("#main>div").css("cursor","");
            });
            zr.on("mouseout",function(param){
                //moveflag=false;
                //$("#main>div").css("cursor","");
            });

            function crossLineChange(x,y){
                var crossLine=zr.storage.get("crossLine");
                //获取十字线吸附状态
                var ret=candlePainter.adsorb(x,y,true);
                //计算x轴和y轴显示内容
                //设置十字线状态
                crossLine.buildPath({x:ret.x,
                    y:ret.y,
                    candleData:candleQueue.get(ret.index),
                    price:ret.price,
                    time:ret.time,
                    index:ret.index});
                crossLine.__dirty=true;
                zr.render();
            }

            var assistLineIndex=0;
            function addAssistLine(){

                var assistLine = new AssistLine({
                    id:"assistLine"+assistLineIndex,
                    style: {
                        index:assistLineIndex,
                        chartGroup:true,
                        xStart: 100,
                        yStart: 100,
                        xEnd: 200,
                        yEnd: 200
                    }
                },zr,config);
                assistLineIndex++;
                zr.addGroup(assistLine);
                config.assistLineMove=false;
                zr.render();
            }
            function delAssistLine(){
                for (; assistLineIndex >= 1; assistLineIndex--) {
                    var line=zr.storage.get("assistLine"+(assistLineIndex-1));
                    line.dispose();
                    zr.delGroup(line.id);
                };
                zr.render();
            }
            var fibonacciLineIndex=0;
            function addGoldLine(){
                var fibonacciLine = new FibonacciLine({
                    id:"fibonacciLine"+fibonacciLineIndex,
                    style: {
                        index:fibonacciLineIndex,
                        xStart: 100,
                        yStart: 100,
                        xEnd: 200,
                        yEnd: 200
                    }
                },zr,config);
                fibonacciLineIndex++;
                zr.addGroup(fibonacciLine);
                config.assistLineMove=false;
                zr.render();
            }

            window.kChart={
                assistLine:addAssistLine,
                deleteAssistLine:delAssistLine,
                addGoldLine:addGoldLine,
                update:function(data){
                    candlePainter.update(data,0);
                    zr.render();
                },
                scale:function(index){
                    if(index===0)
                        candlePainter.less();
                    else
                        candlePainter.more();
                    zr.render();
                },
                move:function(index){
                    if(index===0)
                        candlePainter.translate(40);
                    else
                        candlePainter.translate(-40);
                    zr.render();
                },
                priceLine:function(type){
                    var priceLine=zr.storage.get("priceLine");
                    if(type){
                        if(priceLine){
                            priceLine.show();
                            return;
                        }
                        //3.添加更新事件
                        priceLine = new PriceLine({
                            id:"priceLine",
                            style: {
                                lineWidth:zr.getWidth()-kAxis.getWidth(),
                                rectWidth:kAxis.getWidth(),
                                rectHeight:20,
                                rectColor:'cyan'
                            }
                        },zr);
                        zr.addGroup(priceLine);
                        zr.render();
                    }else{
                        //目前只是隐藏，安全删除需要于移除事件，delete对象，从zrstroge删除等操作
                        priceLine.hide();
                        zr.render();
                    }
                },
                crossLine:function(type){
                    var crossLine=zr.storage.get("crossLine");
                    if(type){
                        if(crossLine){
                         config.crossLineOpen=true;
                         crossLine.show();
                         crossLineChange(crossLine.style.lineWidth/2,crossLine.style.lineHeight/2);
                         return;   
                        }
                        //创建十字线
                        crossLine = new CrossLine({
                            id:"crossLine",
                            style: {
                                x:50,
                                y:50,
                                lineWidth:zr.getWidth()-kAxis.getWidth(),
                                lineHeight:zr.getHeight()-kAxis.getHeight(),
                                rectWidth:kAxis.getWidth(),
                                rectHeight:20,
                                tipRectWidth:80,
                                tipRectHeight:50
                            }
                        },zr);
                        config.crossLineOpen=true;//不能移动
                        zr.addGroup(crossLine);
                        crossLineChange(crossLine.style.lineWidth/2,crossLine.style.lineHeight/2);
                    }else{
                        crossLine.hide();
                        zr.render();
                        config.crossLineOpen=false;
                    }
                },
                quota:function(){
                    if(quota)return;
                    quota=new Quota(zr);
                    zr.render();
                },
                delQuota:function(){
                    quota.dispose();
                    quota=undefined;
                    zr.render();
                }
            };
        }
        	return init; 
        }
    );
(function(w){
	w.kChart={};
	kChart.init=function(dom,options){
		require(["kChart"],function(k){
			k(dom,options);
		});
	};
})(window);
