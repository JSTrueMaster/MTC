import React, { useContext } from "react";
import api from "src/api";
import CfsTable from "src/components/admin/CfsTable";
import changeElementValue from "src/utils/elementvalue"
import HomeContext from "src/state/index.context";

const Cfs = () => {
  React.useEffect(() => {
    changeElementValue("subTitle", "CF確認表");
  }, [])

  const {
    state: { storeName },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  return (
    <div className="w-11/12 h-[75%] mx-auto mt-5">
      <CfsTable storeName={storeName} />
    </div>
  );
};

export default Cfs;