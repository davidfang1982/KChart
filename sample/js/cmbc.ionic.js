    /*var fileLocation = './js/kChart';
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
        w.kchart={};
        kchart.init=function(dom,options){
            require(["zrender/kChart"],function(k){
                k.init(dom,options);
                kchart=k;
            });
        }
    })(window);*/

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
    function init(){
        kchart.init("main",{
            data:data,
            step:1,
            dataType:["20160118161955","M1","UC"],
            theme:{
                background:"black",
                KAxis_price_text_font:"normal 8px Arial"
            }
        });
    }

    function scale(index){
            kchart.scale(index);
        }
        function move(index){
            kchart.move(index);
        }
        var pLineFlag=true,cLineFlag=true;
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
    document.body.onload=function(){
        var height=$(window).height();
        height=height;
        document.getElementById("outter").style.height=height+"px";
        document.getElementById("main").style.height=(height-88)+"px";
        init();

    }
    var myElement = document.getElementById('main');
    var hammertime = new Hammer(myElement);
    hammertime.add(new Hammer.pinch());
    hammertime.on('swipe', function(ev) {
        console.log(ev);
        kchart.swipe(ev.deltaX);
    });
    hammertime.on('pinchend', function(ev) {
        var size=Math.round(ev.scale),flag=size>0?0:1;
        for(var x=0;x<=size;x++){
            kchart.scale(flag);
        }
    });