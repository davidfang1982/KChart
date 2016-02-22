
define(
    function (require) {
       
        /**
        *用于进行时间转换
        *beginDate：
        *       20160118143125
        *dateSpan:
        *       M1 1分钟
        *       M5 5分钟
        *       M15 15分钟
        *       M30 30分钟
        *       H1  1小时
        *       H4  4小时
        *       D1  1天
        *       W1  1周
        *       MN  1月
        */
        var CandleDate = function (beginDate,dateSpan) {
               this.dateSpan=dateSpan;
               this.setDate(beginDate,dateSpan);
        };

        CandleDate.prototype =  {
            getDate:function(){
                return this.date;
            },
            setDate:function(beginDate,dateSpan){
                dateSpan=dateSpan||this.dateSpan;
                //将beginDate转为Date对象
                var year=parseInt(beginDate.substring(0,4),10);
                var month=parseInt(beginDate.substring(4,6),10);
                var date=parseInt(beginDate.substring(6,8),10);
                var hour=parseInt(beginDate.substring(8,10),10);
                var minute=parseInt(beginDate.substring(10,12),10);
                var second=parseInt(beginDate.substring(12,14),10);
                this.date=new Date(year,month,date,hour,minute,second);
                if(dateSpan.charAt(0)==='M'){//分60
                    this.timeSpan=60*dateSpan.substring(1);
                    this.fmt="HH:mm";
                }else if(dateSpan.charAt(0)==='H'){//时60*60
                    this.timeSpan=3600*dateSpan.substring(1);
                    this.fmt="MM-dd-HH";
                }else if(dateSpan.charAt(0)==='D'){//天60*60*24
                    this.timeSpan=86400*dateSpan.substring(1);
                    this.fmt="yyyy-MM-dd";
                }else if(dateSpan.charAt(0)==='W'){//周60*60*24*7
                    this.timeSpan=604800*dateSpan.substring(1);
                    this.fmt="yyyy-MM-dd";
                }else{//月
                    this.timeSpan=0;
                    this.fmt="yyyy-MM";
                }
            },
            //yyyyMMddHHmmss
            formate:function(date,fmt,getDate){
                var year=date.getFullYear();
                var month=date.getMonth()+1;
                var day=date.getDate();
                var hour=date.getHours();
                var minute=date.getMinutes();

                if(typeof fmt==='number'){//月份，此时fmt为增减数量
                    var yearSeg=fmt/12;
                    year=year+yearSeg;
                    fmt=fmt%12;
                    fmt=month+fmt;//month(1-12) 1-3
                    if(fmt>12){
                        year++;
                        fmt-=12;
                    }else if(fmt<1){
                        year--;
                        fmt+=12;
                    }
                    month=fmt;
                }
                if(getDate){//获取标志
                        return new Date(year,month-1,day,hour,minute,0);
                }

                if(month<10)month="0"+month;
                if(day<10)day="0"+day;
                if(hour<10)hour="0"+hour;
                if(minute<10)minute="0"+minute;

                fmt=fmt.replace(/yyyy/,year);
                fmt=fmt.replace(/MM/,month);
                fmt=fmt.replace(/dd/,day);
                fmt=fmt.replace(/HH/,hour);
                fmt=fmt.replace(/mm/,minute);
                return fmt;
            },
            //初始化或set设置了初始日期和日期间隔，times为增减
            //返回增减后的日期
            crease: function (times) {
                if(this.timeSpan===0){//月增减
                    return this.formate(this.date,times);
                }else{
                    var time=this.date.getTime()+times*1000*this.timeSpan;
                    time=new Date(time);
                     return this.formate(time,this.fmt);
                }
               
            },
            //this.date为初始日期
            //times为增减数
            //返回为Date对象
            creaseDate:function(times){
                if(this.timeSpan===0){//月
                    return this.formate(this.date,times,true);
                }else{
                    var time=this.date.getTime()+times*1000*this.timeSpan;
                    return new Date(time);
                }
            },
            updateDate:function(date){
                this.date=date;
            },
        };
        return CandleDate;
    }
);
