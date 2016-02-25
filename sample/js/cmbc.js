    kChart.init("main");
    function scale(index){
        window.kChart.scale(index);
    }
    function move(index){
        window.kChart.move(index);
    }
    var pLineFlag=true,cLineFlag=true,updateFlag=true;
    function priceLine(){
         window.kChart.priceLine(pLineFlag);
         pLineFlag=!pLineFlag;
    }
    function update(){
        window.kChart.update(updateFlag);
        updateFlag=!updateFlag;
    }
    function crossLine(){
        window.kChart.crossLine(cLineFlag);
         cLineFlag=!cLineFlag;
    }
    function assistLine(){
        window.kChart.assistLine();
    }
    function deleteAssistLine(){
        window.kChart.deleteAssistLine();
    }
    function addGoldLine(){
        window.kChart.addGoldLine();
    }
    function quota(){
        window.kChart.quota();
    }
    function delQuota(){
        window.kChart.delQuota();
    } 
    function delGoldLine(){
        window.kChart.delGoldLine();
    }