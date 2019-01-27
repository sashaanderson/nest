import React from 'react';
import PropTypes from 'prop-types';

import { emsp } from 'util/unicode';

class AccountInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      show: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.inputRef = React.createRef();
    this.dropdownMenuRef = React.createRef();
  }

  handleChange(e) {
    const text = e.target.value;
    const account = this.props.accounts.find(a => text == a.accountCode + " - " + a.accountName);
    this.setState({
      show: true,
      text: text,
      selectedAccountId: account && account.accountId,
    });
  }

  handleClick(accountId, e) {
    e.preventDefault();
    const account = this.props.accounts.find(a => a.accountId === accountId);
    this.setState({
      selectedAccountId: account.accountId,
      text: account.accountCode + " - " + account.accountName,
      show: false,
    });
    this.props.onChange && this.props.onChange(account.accountId);
  }

  handleFocus(e) {
    if (e.target === this.inputRef.current) {
      this.dropdownMenuIndex = -1;
    }
    clearTimeout(this.showTimeoutId);
    if (!this.state.show) {
      this.setState({ show: true });
    }
  }

  handleBlur() {
    this.showTimeoutId = setTimeout(() => {
      if (this.state.show) {
        this.setState({ show: false });
      }
    }, 0);
  }

  handleKeyDown(e) {
    if (e.target !== this.inputRef.current) { // dropdown menu or item
      if (e.keyCode == 38) { // up
        e.preventDefault();
        const menuItems = $(this.dropdownMenuRef.current).children(".dropdown-item");
        if (this.dropdownMenuIndex == 0) {
          this.inputRef.current.focus();
        } else if (this.dropdownMenuIndex > 0) {
          menuItems[--this.dropdownMenuIndex].focus();
        }
      } else if (e.keyCode == 8) { // backspace
        e.preventDefault();
        this.inputRef.current.focus();
      }
    }

    if (e.keyCode == 27) { // escape
      e.preventDefault();
      this.setState({ show: false });
    }
  
    if (e.keyCode == 40) { // down
      e.preventDefault();
      const menuItems = $(this.dropdownMenuRef.current).children(".dropdown-item");
      if (this.dropdownMenuIndex < menuItems.length - 1) {
        menuItems[++this.dropdownMenuIndex].focus();
      }
    }
  }

  findAncestors(accountId) {
    const accountIds = [];
    let account = this.props.accounts.find(a => a.accountId === accountId);
    while (account.parentAccountId) {
      account = this.props.accounts.find(a => a.accountId === account.parentAccountId);
      accountIds.unshift(account.accountId);
    }
    return accountIds;
  }

  findDescendants(accountId) {
    const accountIds = this.props.accounts
      .filter(account => account.parentAccountId === accountId)
      .map(account => account.accountId);
    for (let accountId of accountIds) {
      accountIds.push(...this.findDescendants(accountId));
    }
    return accountIds;
  }

  renderDropdownMenu() {
    let accounts, accountTypes;
    if (this.state.text && !this.state.selectedAccountId) {
      accounts = [...new Set(this.props.accounts
        .filter(account => (account.accountCode + " - " + account.accountName)
          .toLowerCase()
          .includes(this.state.text.toLowerCase()))
        .map(account => account.accountId)
        .reduce((a, accountId) =>
          a.concat(this.findAncestors(accountId))
           .concat([accountId])
           .concat(this.findDescendants(accountId)), [])
        )].map(accountId => this.props.accounts.find(account => account.accountId === accountId));
      accountTypes = this.props.accountTypes.filter(accountType =>
        accounts.some(account => account.accountTypeId === accountType.accountTypeId));
    } else {
      accounts = this.props.accounts;
      accountTypes = this.props.accountTypes;
    }
    if (accounts.length == 0 || accountTypes.length == 0) {
      return;
    }
    return (
      <div className={"shadow dropdown-menu dropdown-menu-right" + (this.state.show ? " show" : "")}
        style={{maxHeight: "60vh", overflowY: "auto", minWidth: "100%"}}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyDown={this.handleKeyDown}
        ref={this.dropdownMenuRef}
        tabIndex="-1"
       >{accountTypes.map(accountType => (
          <React.Fragment key={accountType.accountTypeId}>
            {accountType !== accountTypes[0] &&
              <div className="dropdown-divider"></div>
            }
            <h6 className="dropdown-header">
              {accountType.accountTypeCode + " - " + accountType.accountTypeName}
              {accounts !== this.props.accounts &&
                <small className="float-right">
                  Showing {accounts
                    .filter(account => account.accountTypeId === accountType.accountTypeId).length
                  } out of {this.props.accounts
                    .filter(account => account.accountTypeId === accountType.accountTypeId).length
                  }
                </small>}
            </h6>
            {accounts
              .filter(account => account.accountTypeId === accountType.accountTypeId)
              .filter(account => !account.parentAccountId)
              .map(account => this.renderDropdownItem(account, accounts))}
          </React.Fragment>
        ))}
      </div>
    );
  }

  renderDropdownItem(account, accounts, depth = 0) {
    const label = account.accountCode + " - " + account.accountName;
    const active = this.state.text === label;
    return (
      <React.Fragment key={account.accountId}>
        <a className={"dropdown-item" + (active ? " active" : "")}
          href="#"
          onClick={this.handleClick.bind(this, account.accountId)}
          tabIndex="-1"
         >{emsp.repeat(depth)}
          {active ? label : this.renderLabel(label)}
        </a>
        {accounts
          .filter(a2 => a2.parentAccountId == account.accountId)
          .map(a2 => this.renderDropdownItem(a2, accounts, depth + 1))}
      </React.Fragment>
    );
  }

  renderLabel(label) {
    const i = label.toLowerCase().indexOf(this.state.text.toLowerCase());
    if (this.state.text && i >= 0) {
      return (
        <span>
          {label.substring(0, i)}
          <span className="bg-warning">
            {label.substring(i, i + this.state.text.length)}
          </span>
          {label.substring(i + this.state.text.length)}
        </span>
      );
    } else {
      return (
        <span>{label}</span>
      );
    }
  }

  render() {
    return (
      <React.Fragment>
        <input
          type="text"
          className="form-control"
          id={this.props.id}
          placeholder={this.props.placeholder}
          value={this.state.text}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
          ref={this.inputRef}
        />
        {this.renderDropdownMenu()}
      </React.Fragment>
    );
  }
}

AccountInput.propTypes = {
  accountTypes: PropTypes.array,
  accounts: PropTypes.array,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
};

export default AccountInput;
