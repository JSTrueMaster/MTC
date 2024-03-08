import React, { useContext } from "react";
import api from "src/api";
import changeElementValue from "src/utils/elementvalue"
import image from "../../assets/image/image.png"
import SalesTableOfDashboard from "src/components/admin/SalesTableOfDashboard";
import SalesInsertTableOfDashboard from "src/components/admin/SalesInsertTableOfDashboard";
import PreciousMetalOfDashboard from "src/components/admin/PreciousMetalOfDashboard";
import SalesclientOfDashboard from "src/components/admin/SalesclientOfDashboard";
import SalesStampOfDashboard from "src/components/admin/SalesStampOfDashboard";
import SalesOldCoinOfDashboard from "src/components/admin/SalesOldCoinOfDashboard";
import SalesCellphoneOfDashboard from "src/components/admin/SalesCellphoneOfDashboard";
import SalesOthersOfDashboard from "src/components/admin/SalesOthersOfDashboard";
import SalesIntroOfDashboard from "src/components/admin/SalesIntroOfDashboard";
import SalesFrontstoreOfDashboard from "src/components/admin/SalesFrontstoreOfDashboard";
import SalesHPOfDashboard from "src/components/admin/SalesHPOfDashboard";
import SalesInsertOfDashboard from "src/components/admin/SalesInsertOfDashboard";
import SalesVouchersOfDashboard from "src/components/admin/SalesVouchersOfDashboard";

import HomeContext from "src/state/index.context";

const Dashboard = () => {
    
    const {
        state: { storeName },
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    React.useEffect(() => {
        changeElementValue("subTitle", "ダッシュボード");
    }, [])


    return (
        <div className="w-full mx-auto !h-full mt-5 overflow-y-auto">
            <div className="w-11/12 mx-auto">
                {/* <掲示板情報 end /> */}
                <div className="mt-5">
                    <SalesTableOfDashboard storeName={storeName} />
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesInsertTableOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <PreciousMetalOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesclientOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesIntroOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesStampOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesFrontstoreOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesOldCoinOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesHPOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesCellphoneOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesVouchersOfDashboard storeName={storeName} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-0 font-normal text-[#575757] text-[14px] leading-[24px] mt-[30px]">
                    <div>
                        <SalesOthersOfDashboard storeName={storeName} />
                    </div>
                    <div>
                        <SalesInsertOfDashboard storeName={storeName} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;