import React, { useContext, useEffect, useState } from "react";
import SafetyTable1 from "src/components/store/SafetyTable1";
import SafetyTable2 from "src/components/store/SafetyTable2";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const Safety = () => {

  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  
  React.useEffect(() => {
    changeElementValue("subTitle", "小口・金庫金確認表");
  }, [])

  return (
    <div className=" flex flex-col h-[85%] overflow-y-auto">
      <div className="w-11/12 h-[75%] mx-auto mt-5">
        <SafetyTable1 storeName={storeName} />      
      </div>
      <div className="safetyTable w-11/12 h-[75%] mx-auto mt-[9vh] mb-[5vh]">
      <SafetyTable2 storeName={storeName} />
      </div>
    </div>
  );
};

export default Safety;