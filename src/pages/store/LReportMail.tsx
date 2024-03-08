
import React, { useContext, useEffect, useState } from "react";
import api from "src/api";
import LReportMailTable from "src/components/store/LReportMailTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const LReportMail = () => {

  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  React.useEffect(() => {
    changeElementValue("subTitle", "着地報告メール送信");
  }, [])

  return (
    <div className="w-11/12 h-[80%] mx-auto mt-5">
      <LReportMailTable storeName={storeName} />
    </div>
  );
};

export default LReportMail;