var fileLocation = './js/kChart';
require.config({
    packages: [
        {
            name: 'zrender',
            location: '../src',
            main: 'zrender'
        }
    ]
});
(function(w){
    w.kChart={};
    kChart.init=function(dom,options){
        require(["zrender/kChart"],function(k){
            k.init(dom,options);
            kChart=k;
            // kChart.zr.on("mousedown",function(param){
            //                 if(kChart.config.crossLineOpen){
            //                     kChart.crossLineChange(param.event.layerX||param.event.x||param.event.zrenderX,
            //                         param.event.layerY||param.event.x||param.event.zrenderY);
            //                     return;//不能移动
            //                 }
            //                 if(kChart.config.assistLineMove){
            //                     kChart.config.moveflag=false;
            //                     return;
            //                 }
            //                 kChart.config.moveflag=true;
            //                 offsetX=param.event.offsetX;
            //                 zrenderX=param.event.zrenderX;
            //                 $("#"+id+">div").css("cursor","col-resize");
            //             });
            //             kChart.zr.on("mousemove",function(param){
            //                 if(kChart.config.crossLineOpen||kChart.config.assistLineMove)return;//不能移动
            //                 if(kChart.config.moveflag){
            //                     var movement=param.event.movementX;
            //                     movement=(movement==undefined||isNaN(movement))?(param.event.offsetX-offsetX):movement;
            //                     movement=(movement==undefined||isNaN(movement))?(param.event.zrenderX-zrenderX):movement;
            //                     var flag=kChart.candlePainter.translate(movement);
                                
            //                     zrenderX=param.event.zrenderX;
            //                     offsetX=param.event.offsetX;
            //                     flag||kChart.zr.render();
            //                 }
            //             });
                    
            //             kChart.zr.on("mouseup",function(param){
            //                 if(kChart.config.crossLineOpen||kChart.config.assistLineMove)return;//不能移动
            //                 //setTimeout(kchart.animation,100);
            //                 kChart.config.moveflag=false;
            //                 $("#main>div").css("cursor","");
            //             });
        });
    }
})(window);

//1.先设置初始数据
var _last;
function getRandom(last){
    var ret=new Array();
    for(var y=0;y<2;y++){
        var t=(2033+(20*Math.random())).toFixed(2);
        ret.push(t);
    }
    if(last)ret[1]=last;//收盘等于上一个的开盘价格
    var min=Math.min(ret[0],ret[1]);
    var max=Math.min(ret[0],ret[1]);
    ret.push((max+10*Math.random()).toFixed(2));
    min=Math.min(ret[1],ret[2]);
    ret.push((min-10*Math.random()).toFixed(2));
    _last=ret[0];//记录开盘价格
    return ret;
}
var data=new Array();
for(var i=0;i<100;i++){
    var tmp=getRandom(_last);
    data.push(tmp);
    // console.log(tmp.join("|"));
}
//初始化
kChart.init("main",{
    data:data,
    dataType:["20160118161955","M5","USDCHN"],
    step:3,
    theme:{
        background:"black"
    }
});

function scale(index){
        kChart.scale(index);
    }
    function move(index){
        kChart.move(index);
    }
    var pLineFlag=true,cLineFlag=true;
    function priceLine(){
         kChart.priceLine(pLineFlag);
         pLineFlag=!pLineFlag;
    }
    function update(){
         kChart.update(getRandom());
    }
    function crossLine(){
        kChart.crossLine(cLineFlag);
         cLineFlag=!cLineFlag;
    }
    function assistLine(){
        kChart.assistLine();
    }
    function deleteAssistLine(){
        kChart.deleteAssistLine();
    }
    function addGoldLine(){
        kChart.addGoldLine();
    }
    function quota(){
        kChart.quota();
    }
    function delQuota(){
        kChart.delQuota();
    } 
    function delGoldLine(){
        kChart.delGoldLine();
    }
    