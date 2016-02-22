 var fileLocation = './js/zrenderSrc';
    require.config({
        paths:{ 
            zrender: fileLocation,
            'zrender/shape/Rectangle': fileLocation,
            'zrender/shape/Line': fileLocation,
            'zrender/shape/Text': fileLocation,
            'zrender/tool/util': fileLocation,
            'zrender/shape/Base': fileLocation,
            'zrender/shape/Circle': fileLocation,
            'zrender/shape/PriceLine': './js/PriceLine',
            'zrender/shape/CrossLine': './js/CrossLine',
            'zrender/shape/AssistLine': './js/AssistLine',
            'zrender/shape/Candle': './js/Candle',
            'zrender/shape/CandleQueue': './js/CandleQueue',
            'zrender/shape/CandleDate': './js/CandleDate',
            'zrender/shape/KAxis': './js/KAxis',
            'zrender/shape/CandlePainter': './js/CandlePainter',
            'zrender/Group':fileLocation
        }
    });
    
    function init(){
    require(
        ['zrender','zrender/shape/CrossLine','zrender/shape/AssistLine','zrender/shape/PriceLine','zrender/shape/Candle','zrender/shape/KAxis','zrender/shape/CandleQueue','zrender/shape/CandlePainter'],
        function(zrender) {
            var zr = zrender.init(document.getElementById('main'));
            var Rectangle = require('zrender/shape/Rectangle');
            var Candle = require('zrender/shape/Candle');
            var KAxis = require('zrender/shape/KAxis');
            var PriceLine = require('zrender/shape/PriceLine');
            var CrossLine = require('zrender/shape/CrossLine');
            var AssistLine = require('zrender/shape/AssistLine');
            var CandleQueue = require('zrender/shape/CandleQueue');
            var Group = require('zrender/Group');
            var CandlePainter = require('zrender/shape/CandlePainter');
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
                    width : 60,
                    height : 30,
                    strokeColor : '#000000',
                    priceFont:"5 Arial"
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
            var data=new Array();
            for(var i=0;i<100;i++){
                var tmp=getRandom();
                data.push(tmp);
                console.log(tmp.join("|"));
            }
            var candleQueue=new CandleQueue(["20160118161955","M1","USDCHN"], data);
            
            //2.创建CandlePainter对象
            var candlePainter=new CandlePainter(chartGroup,zr,kAxis,candleQueue);
            candlePainter.setStep(2);
            candlePainter.paint();
        
            //添加图表和轴线
            zr.addGroup(chartGroup);
            zr.addGroup(axisGroup);

            //3
            //创建辅助线
            
            zr.render();


            //setTimeout(update,1000);
            var updateId;
            function update(){
                candlePainter.update(getRandom(),0);
                zr.render();
               updateId=setTimeout(update,1000);
            }

            function getRandom(){
                var ret=new Array();
                for(var y=0;y<2;y++){

                    var t=(2033+(10*Math.random())).toFixed(2);
                    ret.push(t);
                }
                var min=Math.min(ret[0],ret[1]);
                var max=Math.min(ret[0],ret[1]);
                ret.push((max+10*Math.random()).toFixed(2));
                min=Math.min(ret[1],ret[2]);
                ret.push((min-10*Math.random()).toFixed(2));
                return ret;
            }
            var offsetX,zrenderX;
            zr.on("mousedown",function(param){
                if(config.crossLineOpen){
                    crossLineChange(param.event.layerX||param.event.x,param.event.layerY||param.event.x);
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
                //console.log(config);
                if(config.crossLineOpen||config.assistLineMove)return;//不能移动
                
                if(config.moveflag){
                    //console.log(param.event.zrenderX);
                    var movement=param.event.movementX;
                    movement=(movement==undefined||isNaN(movement))?(param.event.offsetX-offsetX):movement;
                    movement=(movement==undefined||isNaN(movement))?(param.event.zrenderX-zrenderX):movement;
                    var flag=candlePainter.translate(movement);
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
                        yEnd: 200,
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

            window.zrExports={
                assistLine:addAssistLine,
                deleteAssistLine:delAssistLine,
                update:function(flag){
                    if(flag){
                        setTimeout(update,1000);
                    }else{
                        clearTimeout(updateId);
                    }
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
                        });
                        candlePainter.onUpdate(priceLine);
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
                        var crossLine = new CrossLine({
                            id:"crossLine",
                            style: {
                                x:50,
                                y:50,
                                lineWidth:zr.getWidth()-kAxis.getWidth(),
                                lineHeight:zr.getHeight()-kAxis.getHeight(),
                                rectWidth:kAxis.getWidth(),
                                rectHeight:20,
                                rectColor:'#FFF',
                                tipRectWidth:200,
                                tipRectHeight:100,
                                tipRectColor:"#C7BA99"
                            }
                        });
                        config.crossLineOpen=true;//不能移动
                        zr.addGroup(crossLine);
                        crossLineChange(crossLine.style.lineWidth/2,crossLine.style.lineHeight/2);
                    }else{
                        crossLine.hide();
                        zr.render();
                        config.crossLineOpen=false;
                    }
                }
            };
            document.getElementById("main").style.height="860px";
        }
    );
}
    function scale(index){
        window.zrExports.scale(index);
    }
    function move(index){
        window.zrExports.move(index);
    }
    var pLineFlag=true,cLineFlag=true,updateFlag=true;
    function priceLine(){
         window.zrExports.priceLine(pLineFlag);
         pLineFlag=!pLineFlag;
    }
    function update(){
        window.zrExports.update(updateFlag);
        updateFlag=!updateFlag;
    }
    function crossLine(){
        window.zrExports.crossLine(cLineFlag);
         cLineFlag=!cLineFlag;
    }
    function assistLine(){
        window.zrExports.assistLine();
    }
    function deleteAssistLine(){
        window.zrExports.deleteAssistLine();
    }
    document.body.onload=function(){
        var height=$(window).height();
        height=height-88;
        document.getElementById("main").style.height=height+"px";
        init();
    }