
define(
    function (require) {
        //引用CandleDate，用于处理时间数据
        var CandleDate = require('./CandleDate');

        //dataStyle 格式["20160118161955","M1"]
        var CandleQueue = function (dataStyle,data) {
               //   this.setData(dataStyle,data);
               // this.header=0;//头
               // this.footer=0;//尾
               this._data=undefined;//存放数据
               //this.beginDate=undefined;//队列中头对应的时间
               //this.candleDate=new CandleDate(dataStyle[0],dataStyle[1]);
               this.setData(dataStyle,data);//设置数据格式及其数据
               this.currType=dataStyle[2];
               this.timeType=dataStyle[1];
        };

        CandleQueue.prototype =  {
            
            isArray: function( obj ) {
                return toString.call(obj) === "[object Array]";
            },
            //队头插入若干数据
            //遍历data，设置datax轴文字显示内容和头尾指针
            prepend:function(data){
                for(var i=0;i<data.length;i++){
                    this._data.unshift(data[i]);
                }
                //设置起始日期
                var beginDate=this.candleDate.creaseDate(data.length);
                this.candleDate.updateDate(beginDate);
            },
            update:function(index,data){
                this._data[index]=data;
            },
            //队尾追加若干数据
            //遍历data，设置datax轴文字显示内容和头尾指针
            append:function(data){
                 for(var i=0;i<data.length;i++){
                    this._data.push(data[i]);
                 }
                 //不需要设置起始日期
            },
            //设置数据
            //设置数据格式和x轴文字偏移，遍历data
            setData:function(dataStyle,data){
                this.candleDate=new CandleDate(dataStyle[0],dataStyle[1]);
                this._data=data;
                //this.beginDate=this.candleDate.getDate();
                //this.candleDate.setDate(this.beginDate);
            },
            
            //获取begn~end数据内的max和min
            //返回为一个对象{max:max,min:min}
            getMaxmin:function(begin,end){
                var max=0,min=0;
                begin=begin||0;
                end=end||this._data.length;
                if(end>this._data.length){
                    end=this._data.length;
                }
                for(var i=begin;i<end;i++){
                    if(i==begin)
                        min=this._data[i][0];
                    for(var j=0;j<4;j++){
                        max=Math.max(max,this._data[i][j]);
                        min=Math.min(min,this._data[i][j]);
                    }
                }
                return {max:max,min:min};
            },
            //返回第index的数据
            get:function(index){
                return this._data[index];
            },
            size:function(){
                return this._data.length;
            },
            creaseDate:function(span){
                return this.candleDate.crease(span);
            }
        };
        return CandleQueue;
    }
);
