import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import DiffTable from "src/components/store/DiffTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const Diff = () => {
  
  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  changeElementValue("subTitle", "卸先別差異確認表");
  
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <DiffTable storeName={storeName} />
    </div>
  );
};

export default Diff;