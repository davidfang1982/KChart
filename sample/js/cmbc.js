    var _last;
    //获取随机数据
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
    //初始化数据
    var data=new Array();
    for(var i=0;i<200;i++){
        var tmp=getRandom(_last);
        data.push(tmp);
        // console.log(tmp.join("|"));
    }
    //初始化div
    kchart.init("main",{
        data:data,
        step:3,
        dataType:["20160118161955","M1","USDCHN"],
        theme:{
            background:"black"
        }
    });

    function scale(index){
        kchart.scale(index);
    }
    function move(index){
        kchart.swipe(index);
    }
    var pLineFlag=true,cLineFlag=true,updateFlag=true;
    function priceLine(){
         kchart.priceLine(pLineFlag);
         pLineFlag=!pLineFlag;
    }
    function update(){
         kchart.update(getRandom());
    }
    function crossLine(){
        kchart.crossLine(cLineFlag);
         cLineFlag=!cLineFlag;
    }
    function assistLine(){
        kchart.assistLine();
    }
    function deleteAssistLine(){
        kchart.deleteAssistLine();
    }
    function addGoldLine(){
        kchart.addGoldLine();
    }
    function quota(){
        kchart.quota();
    }
    function delQuota(){
        kchart.delQuota();
    } 
    function delGoldLine(){
        kchart.delGoldLine();
    }
