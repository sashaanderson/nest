package oasisledger.server.data;

import org.hibernate.validator.constraints.NotEmpty;

public class AccountDTO {

    private int accountId;
    public int getAccountId() { return accountId; }
    public void setAccountId(int accountId) { this.accountId = accountId; }

    private int accountTypeId;
    public int getAccountTypeId() { return accountTypeId; }
    public void setAccountTypeId(int accountTypeId) { this.accountTypeId = accountTypeId; }

    private Integer parentAccountId = null;
    public Integer getParentAccountId() { return parentAccountId; }
    public void setParentAccountId(Integer parentAccountId) { this.parentAccountId = parentAccountId; }

    @NotEmpty
    private String accountCode;
    public String getAccountCode() { return  accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    @NotEmpty
    private String accountName;
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    private char activeFlag = 'Y';
    public char getActiveFlag() { return activeFlag; }
    public void setActiveFlag(char activeFlag) {
        if (!(activeFlag == 'N' || activeFlag == 'Y')) {
            throw new IllegalArgumentException("Invalid activeFlag: " + activeFlag);
        }
        this.activeFlag = activeFlag;
    }
}