import BillingCalculationDialog from "@/components/billing/BillingCalculationDialog";
import BillingHeader from "@/components/billing/components/BillingHeader";
import BillingFilters from "@/components/billing/components/BillingFilters";
import BillingTable from "@/components/billing/components/BillingTable";
import BillingDetailDialog from "@/components/billing/components/BillingDetailDialog";
import { useBillingPage } from "@/components/billing/hooks/useBillingPage";
import { useBillingDetail } from "@/components/billing/hooks/useBillingDetail";
import * as XLSX from "xlsx";

const BillingPage = () => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedMonth,
    setSelectedMonth,
    billings,
    filteredBillings,
    loading,
    showCalculationDialog,
    setShowCalculationDialog,
    fetchBillings,
    handleMarkAsPaid
  } = useBillingPage();

  const {
    selectedBilling,
    isDetailDialogOpen,
    openDetailDialog,
    closeDetailDialog,
    setIsDetailDialogOpen
  } = useBillingDetail();
  const exportToExcel = () => {
    const data = filteredBillings.map((billing) => ({
      "เดือน": new Date(billing.billing_month).toLocaleDateString("th-TH", { year: "numeric", month: "long" }),
      "เลขที่ใบเสร็จ": billing.receipt_number || "-",
      "ชื่อผู้เช่า": `${billing.tenants.first_name} ${billing.tenants.last_name}`,
      "ห้อง": billing.rooms.room_number,
      "ค่าห้อง": billing.room_rent,
      "ค่าน้ำ": billing.water_cost,
      "ค่าไฟ": billing.electricity_cost,
      "รวม": billing.total_amount,
      "ครบกำหนด": new Date(billing.due_date).toLocaleDateString("th-TH"),
      "สถานะ": billing.status,
      "วันที่ชำระ": billing.paid_date ? new Date(billing.paid_date).toLocaleDateString("th-TH") : "ยังไม่ได้ชำระ"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Billings");
    XLSX.writeFile(wb, "billings.xlsx");
  };

  if (loading) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <BillingHeader onOpenCalculationDialog={() => setShowCalculationDialog(true)} exportToExcel={exportToExcel} />

      <BillingFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <BillingTable
        billings={billings}
        filteredBillings={filteredBillings}
        onMarkAsPaid={handleMarkAsPaid}
        onViewDetails={openDetailDialog}
      />

      <BillingCalculationDialog
        open={showCalculationDialog}
        onOpenChange={setShowCalculationDialog}
        onBillingCreated={fetchBillings}
      />

      <BillingDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        billing={selectedBilling}
      />
    </div>
  );
};

export default BillingPage;
