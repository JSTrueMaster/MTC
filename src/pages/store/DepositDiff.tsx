import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import DepositDiffTable from "src/components/store/DepositDiffTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const DepositDiff = () => {

  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);


  React.useEffect(() => {
    changeElementValue("subTitle", "入金日別差異確認表");
  }, [])

  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">      
        <DepositDiffTable storeName={storeName} />
    </div>
  );
};

export default DepositDiff;