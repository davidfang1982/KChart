

define(
    function (require) {
        
        var Candle = require('./Candle');
        //chartGroup：将k线图加入此group
        //zr：画布
        //kAxis：坐标轴refresh
        var theme;
        var CandlePainter = function (chartGroup,zr,kAxis,candleQueue) {
            theme=zr.theme;
            //cWidth,cHeight,xHeight,yWidth
            chartGroup.id="chartGroup";
            chartGroup.cPainter=this;
            this.cWidth=zr.getWidth();//canvas width
            this.cHeight=zr.getHeight();//canvas height
            this.xHeight=kAxis.getHeight();//x-axis height
            this.yWidth=kAxis.getWidth();//y-axis width
            this.pHeight=this.cHeight-this.xHeight;//painter area height
            this.pWidth=this.cWidth-this.yWidth;//painter area width
            
            //this.interval=10;//蜡烛之间的间隔
            //this.radius=16;//蜡烛的宽度
            //this.candleWidth=this.radius*2+this.interval;//蜡烛宽度+间隔
            //this.candleCount=parseInt(this.pWidth/this.candleWidth,10)+2;//可容纳的蜡烛数量

            this.chartGroup=chartGroup;
            this.kAxis=kAxis;
            this.zr=zr;
            this.candleQueue=candleQueue;//保存展现的数据
            
            
            this.drift=0;//平移时的偏移量

            this.showBegin=0;//当前展示的图表起始/结束位置
            this.showEnd=0;//this.candleCount/2+1;
            //this.showEnd=parseInt(this.showEnd,10);

            //初始绘制位置
            this.xBegin=(this.pWidth/2);
            this.yBegin=0;

            //记录上次的showBegin和showEnd
            this.showBeginPrev=this.showBegin;
            this.showEndPrev=this.showEnd;

            //x轴竖线之间的蜡烛个数
            this.scaleStep=[1,2,3,4,6,8,12,24,32];
            //x轴竖线的个数
            this.xLineCount=6.5;
            
            //update后的回调函数
            this.updateCallback=[];//new Array();
            this.paintCallback=[];//new Array();
            this.scaleCallback=[];//new Array();
            //可以移动
            this.moveable=true;
            this.candleCountMax=this.scaleStep[this.scaleStep.length-1]*6.5;
            //
            this.adsorbY=20;
        };

        CandlePainter.prototype =  {
            //更新函数
            onUpdate:function(fn){
                this.updateCallback.push(fn);
            },
            //xData[0]为beginshow，xData[1]为间隔
            paint : function (begin,end) {
                begin=begin||this.showBegin;
                end=end||this.showEnd;
                this._initData(begin,end);
                this._paintCandle(begin,end);
                //刷新坐标轴
                this.kAxis&&this.kAxis.refreshX(this);
                this.kAxis&&this.kAxis.refreshY(this);
            },
            //更新接口1：data的内容为：开/收 高-低
            update:function(data,index){
                this.candleQueue.update(index,data);
                if(index>=this.showBegin&&index<=this.showEnd){
                    //若最大/最小值发生变化
                    var ret=this.candleQueue.getMaxmin(index,index+1);
                    //不能跟this.ymax比，跟当前范围的最大最小比较
                    var _max=(ret.max>this.dataMax)?ret.max:undefined;
                    var _min=(ret.min<this.dataMin)?ret.min:undefined;
                    if(_max!==undefined||_min!==undefined){
                        //需要刷新y轴,指定最大、最小值，避免重新遍历数组
                        this._initData(this.showBegin,this.showEnd,_max,_min);
                        this.kAxis.refreshY(this);
                        //刷新shape
                        this._paintCandle(this.showBegin,this.showEnd);
                    }else{
                        //只刷新了更新的candle
                        this._paintCandle(index,index+1);
                    }
                    
                }
                this.kAxis.refreshPriceText(data,this.candleQueue.currType+","+this.candleQueue.timeType);
                //依次执行监听函数
                for(var i=0;i<this.updateCallback.length;i++){
                    //参数依次为:data数组，更新的index，计算出的y的值
                    this.updateCallback[i].whenUpdate(data,index,this.getYPx(data[1]));
                }
            },
            //更新接口2：向队头添加数据
            prepend:function(data){
                this.candleQueue.prepend(data);
                //若在范围内，才需要刷新
                if(0===this.showBegin){   
                    this.kAxis.refreshX(this,NaN);
                    //计算Y轴数据
                    this._initData(this.showBegin,this.showEnd);
                    //刷新shape
                    this._paintCandle(this.showBegin,this.showEnd);
                    //刷新Y轴
                    this.kAxis.refreshY(this);
                }
            },
            //更新接口3：向队尾添加数据
            append:function(data){
                this.candleQueue.append(data);
            },
            //平移,返回true时不需要render
            //有时候也需要未移动的时候刷新,通过refresh指定
            translate:function(movementX,refresh){
                //不可用移动
                if(!this.moveable&&!refresh)return true;
                //未设置refresh且未移动
                if(movementX===0&&!refresh)return true;
                
                //左移不能超过
                var tmp=this.drift+movementX;
                if(tmp<0){
                    return true;
                }
                //记录偏移距离
                this.drift=tmp;

                //计算一下显示的，设置y轴的数据 yMax和PPYP
                //fix bug 20160301
                var size=parseInt((refresh?movementX:tmp)/this.candleWidth,10);
                if(size<this.candleCount/2){
                    this.showBegin=0;
                    this.showEnd=this.candleCount/2+size+1;
                }else{
                    this.showBegin=size-this.candleCount/2+1;
                    this.showEnd=this.candleCount/2+size+1;
                }
                this.showBegin=parseInt(this.showBegin,10);
                this.showEnd=parseInt(this.showEnd,10);
                //console.log(this.showBegin+"  "+(this.showEnd));
                //移动图表x轴
                this.chartGroup.position[0]+=movementX;
                //刷新X轴
                //console.log(movementX+"  "+refresh);
                this.kAxis.refreshX(this,movementX,refresh);

                //展现范围不同时，才计算Y轴数据，刷新shape和y轴
                if(this.showBeginPrev!=this.showBegin||this.showEndPrev!=this.showEnd||refresh)
                {
                    //计算Y轴数据
                    this._initData(this.showBegin,this.showEnd);
                    //刷新shape
                    this._paintCandle(this.showBegin,this.showEnd);
                    //刷新Y轴
                    this.kAxis.refreshY(this);

                    //发生变化后
                    this.showBeginPrev=this.showBegin;
                    this.showEndPrev=this.showEnd;
                }
            },
            _parseDouble:function(){

            },
            _calcWidth:function(index){
                //x轴线之间有多少个蜡烛
                var xSpan=this.scaleStep[index];
                //x轴线之间的距离
                var xLineInterval=this.pWidth/(this.xLineCount);
                //
                var perCandle=xLineInterval/xSpan/2.6;

                this.interval=perCandle*0.6;//蜡烛之间的间隔
                this.radius=perCandle;//蜡烛的宽度
                this.kAxis.xSpan=xSpan;
            },
            //放大
            more:function(){
                if(this.step===0)
                    return;
                this.scale(this.step-1);
            },
            //缩小
            less:function(){
                if(this.step===this.scaleStep.length-1)
                    return;
                this.scale(this.step+1);
            },
            setStep:function(index){
                this.step=index;
                this._calcWidth(index);
                this.candleWidth=this.radius*2+this.interval;//蜡烛宽度+间隔
                this.candleCount=parseInt(this.pWidth/this.candleWidth,10)+3;//可容纳的蜡烛数量
                this.showEnd=this.candleCount/2+1;
                this.showEnd=parseInt(this.showEnd,10);
            },
            scale:function(index){
                //清除多余candle的显示
                for(var i=0;i<this.candleCountMax;i++){
                     var candle=this.zr.storage.get("candle"+i);
                     if(candle){
                        candle.invisible=true;//true不绘制图形
                    }else{
                        break;
                    }
                }
                //计算当前的时间
                var count=parseInt((this.drift)/this.candleWidth,10);
                //计算当前的宽度
                this.setStep(index);
                //计算偏移
                this.drift=count*this.candleWidth;
                this.chartGroup.position[0]=0;
                var mv=this.drift;
                this.drift=0;
                this.translate(mv,true);
                //
                //需要刷新
                for(i=0;i<this.scaleCallback.length;i++){
                    //参数依次为:data数组，更新的index，计算出的y的值
                    this.scaleCallback[i].whenScale(this.candleWidth);
                }
            },
            //根据yData获取绘制相关变量，获取yData的benin,end之间的y轴的数据
            _initData : function(begin,end,max,min) {
                //begin=begin||0;
                //end=end||this.candleCount;
                var ret={};
                //若指定了max和min 则无需计算
                if(max!==undefined){
                    ret.max=max;
                    ret.min=min||this.dataMin;
                }
                if(min!==undefined){
                    ret.min=min;
                    ret.max=max||this.dataMax;
                }
                //非update时
                if(max===undefined&&min===undefined){
                    ret=this.candleQueue.getMaxmin(begin,end);
                    //这两个只在update时候使用，记录了当前范围内的最大最小
                    this.dataMax=ret.max;
                    this.dataMin=ret.min;
                }

                // price of per y-px
                this.ymax=ret.max+parseFloat(((ret.max-ret.min)/1.1).toFixed(4),10);
                this.ymin=ret.min-parseFloat(((ret.max-ret.min)/1.1).toFixed(4),10);
                this.PPYP=parseFloat(((this.ymax-this.ymin)/(this.pHeight)).toFixed(2),10);
            },
            getXPx:function(index){
               return this.xBegin-(index*this.candleWidth);
            },
            //
            getYPx:function(price){
                return parseFloat(((this.ymax-price)/(this.PPYP)).toFixed(2),10);
            },
            getPrice:function(y){
                return parseFloat((this.ymax-(y*this.PPYP)).toFixed(2),10);
            },

            //获取index的数据
            _getCandleData:function(index){
                return this.candleQueue.get(index);
            },
            //获取index数据的style
            _getCandleStyle:function(index){
                var data=this._getCandleData(index);
                var style={};
                style.x=this.xBegin-(index*this.candleWidth);
                style.y=this.yBegin;
                if(!data){
                    return null;//
                }
                if(data[0]<data[1]){
                    style.white=false;
                    // var tmp=data[1];
                    // data[1]=data[0];
                    // data[0]=tmp;
                }else{
                    style.white=true;
                }
                style.rTop=this.getYPx(data[0]);//开盘/收盘
                style.rBottom=this.getYPx(data[1]);//收盘/开盘
                style.top=this.getYPx(data[2]);//最高
                style.bottom=this.getYPx(data[3]);//最低
                style.radius=this.radius;
                //style.text=index;//调试使用
                return style;
            },
            
            //获取index的candle，
            //若不存在则创建
            //若存在，则设置style
            _getCandle:function(index,id){
                id=(id===undefined)?index:id;
                var candle=this.zr.storage.get("candle"+id);
                var style=this._getCandleStyle(index);
                if(!candle){
                    //console.log("create candle");
                    candle=new Candle({style:style},this.zr);
                    candle.zlevel=1;
                    candle.id="candle"+id;
                    candle.clickable=false;
                    candle.bind("click",function(e){
                        //alert(index);
                    });
                    this.chartGroup.addChild(candle);
                }else{
                    if(style===null)//没这个数据，当前不展现
                        candle.invisible=true;//true不绘制图形
                    else{
                        candle.invisible=false;//false绘制图形
                        candle.style=style;//重新设置图形
                    }
                }
                return candle;
            },
            //根据Queue中的位置获取对应的candle，
            //主要用于更新后获取相关数据，若不在视图内，可能为空
            getCandleByIndex:function(index){
                if(index>this.candleCount){
                        index=index%this.candleCount;
                }
                return this.zr.storage.get("candle"+index);
            },
            //创建candle
            //初始时：绘制0~candleCount个即可
            //缩放时: candleCount变了，创建从candleCount~candleCountNew
            _paintCandle:function(begin,end){
                //console.log(begin+ "  "+end);
                for(var i=begin;i<end;i++){
                    //不能一直创建candle啊，否则内存撑不住，最多创建candleCount个
                    //修改因此candle的id
                    //一直修改id的话，也占用map啊，不能设置
                    //通过计算获取
                    if(i>this.candleCount){
                        this._getCandle(i,i%this.candleCount);
                    }else{
                        this._getCandle(i);
                    }
                    
                }
                //需要刷新一下线段的长度
                for(i=0;i<this.paintCallback.length;i++){
                    //参数依次为:data数组，更新的index，计算出的y的值
                    if(this.paintCallback[i])
                        this.paintCallback[i].whenPaint(this.getYPx);
                }

            },
            onPaint:function(fn){
                this.paintCallback.push(fn);
            },
            rmPaint:function(fn){
                for(var i=0;i<this.paintCallback.length;i++){
                    if(this.paintCallback[i]===fn){
                        this.paintCallback[i]=undefined;
                        break;
                    }
                }
            },
            onScale:function(fn){
                this.scaleCallback.push(fn);
            },
            
            // x和y默认是相对于canvas的坐标，chartsX：true表示是chatsgroup的坐标
            // 返回值是相对于chartsgroup的坐标 
            adsorbExt:function(x,y,calc,chartsX){
               if(chartsX){
                    x=x+this.drift;//转换为相对于canvas的坐标
               }
               var ret=this.adsorb(x,y,calc);
               ret.x-=this.drift;
               return ret;
            },
            //根据x和y获取吸附到candle上的值
            //x和y和返回值都是相对于canvas的偏移量
            adsorb:function(x,y,calc){
                var ret={x:x,y:y,index:0},noneFlag=false;
                if(x>this.drift+this.xBegin){//偏移的右边
                    noneFlag=true;
                    //return ret;
                }
                var maxLen=noneFlag?(x-this.drift-this.xBegin):(this.drift+this.xBegin-x);//获取x点到起始点+偏移的距离
                var mod=maxLen%this.candleWidth;//计算x点距离右边蜡烛的距离
                var size=parseInt(maxLen/this.candleWidth,10);//计算x点右边蜡烛个数
                size=noneFlag?size:-size;//
                var last_x=this.drift+this.xBegin+size*this.candleWidth;//计算右边蜡烛的x
                if(mod>this.candleWidth/2){//下一个
                    ret.x=noneFlag?last_x+this.candleWidth:last_x-this.candleWidth;
                    ret.index=noneFlag?-size-1:-size+1;
                }else if(mod<this.candleWidth/2){
                    ret.x=last_x;
                    ret.index=-size;
                }else{
                    ret.x=x;
                    ret.index=-size;
                }

                //计算y轴的吸附，已经知道index，获取candle的几个值即可
                var candle;
                if(y!==undefined){
                    if(ret.index>=this.candleCount){
                        candle=this.zr.storage.get("candle"+ret.index%this.candleCount);
                    }else{
                        candle=this.zr.storage.get("candle"+ret.index);
                    }
                    if(candle){
                        if(Math.abs(candle.style.rTop-y)<this.adsorbY){
                            ret.y=candle.style.rTop;
                        }else if(Math.abs(candle.style.top-y)<this.adsorbY){
                            ret.y=candle.style.top;
                        }else if(Math.abs(candle.style.rBottom-y)<this.adsorbY){
                            ret.y=candle.style.rBottom;
                        }else if(Math.abs(candle.style.bottom-y)<this.adsorbY){
                            ret.y=candle.style.bottom;
                        }else{
                            ret.y=y;
                        }
                    }else{
                        ret.y=y;
                    }
                }

                //计算x轴和y轴显示内容
                if(calc){
                    ret.time=this.candleQueue.creaseDate(-ret.index);
                    ret.price=this.getPrice(ret.y);
                }
                //alert(ret.index);
                if(!ret.y){
                    console.log(2222);
                }
                return ret;   
            },
            getChartGroup:function(){
                return this.chartGroup;
            },
            getDrift:function(){
                return this.drift;
            },
            _debug:function(txt){
                this.kAxis._debug(txt);
            }
        };

        
        return CandlePainter;
    }
);
