import React, { useContext } from "react";
import ReportTable from "src/components/admin/ReportTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const Report = () => {

  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  React.useEffect(() => {
    changeElementValue("subTitle", "報告書（PL)");
  }, [])
  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <ReportTable storeName={storeName} />
    </div>
  );
};

export default Report;