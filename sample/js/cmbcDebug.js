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
            k(dom,options);
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
    theme:{
        background:"cyan"
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