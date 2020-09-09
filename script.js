//BUDGET CONTROLLER

var budgetContoller = (function () {

    var Expense = function (id, description, amount) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.percentage = -1;
    };

    Expense.prototype.calcPercent = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.amount / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercent = function () {
        return this.percentage;
    };

    var Income = function (id, description, amount) {
        this.id = id;
        this.description = description;
        this.amount = amount;
    };

    var allData = {
        allItems: {
            allExpense: [],
            allIncome: []
        },
        totalItems: {
            totalExpense: 0,
            totalIncome: 0
        },
        budget: 0,
        percentage: -1
    };

    //Calculates the total expenses and income
    var calculateTotal = function (listItems) {
        var total = 0;
        allData.allItems[listItems].forEach(function (current) {
            total += current.amount;
        });

        return total;
    };

    return {

        //Add new item into the data structure
        insertItem: function (opt, desp, amt) {

            var newItem, idNum;
            if (opt === 'inc') {
                if (allData.allItems.allIncome.length > 0) {
                    idNum = allData.allItems.allIncome[allData.allItems.allIncome.length - 1].id + 1;
                } else {
                    idNum = 0;
                }
                newItem = new Income(idNum, desp, amt);
                allData.allItems.allIncome.push(newItem);

            } else if (opt === 'exp') {
                if (allData.allItems.allExpense.length > 0) {
                    idNum = allData.allItems.allExpense[allData.allItems.allExpense.length - 1].id + 1;
                } else {
                    idNum = 0;
                }
                newItem = new Expense(idNum, desp, amt);
                allData.allItems.allExpense.push(newItem);
            }
            return newItem;
        },

        //Calculates the total expenses and income. Also, calculate the budget and percentage of expenses made.
        calculateBudget: function () {

            allData.totalItems.totalExpense = calculateTotal('allExpense');
            allData.totalItems.totalIncome = calculateTotal('allIncome');

            allData.budget = allData.totalItems.totalIncome - allData.totalItems.totalExpense;

            if (allData.totalItems.totalIncome > 0) {
                allData.percentage = Math.round((allData.totalItems.totalExpense / allData.totalItems.totalIncome) * 100);
            } else {
                allData.percentage = -1;
            }

        },

        //Retrieves the Total expenses and Total Income, Budget and Percentage of expenses made.
        getBudget: function () {
            return {
                budget: allData.budget,
                percentage: allData.percentage,
                totalIncome: allData.totalItems.totalIncome,
                totalExpense: allData.totalItems.totalExpense
            };
        },


        //Calculates the percentage of each expenses.
        calculatePercentages: function () {
            allData.allItems.allExpense.forEach(function (current) {
                current.calcPercent(allData.totalItems.totalIncome);
            });
        },

        //Retrieves the percentage of each expenses.
        getPercentages: function () {
            var percentList = allData.allItems.allExpense.map(function (current) {
                return current.getPercent();
            });
            return percentList;
        },


        //Deletes the expense or income stored in the arrays.
        deleteDataValue: function (rowType, rowID) {
            var option, idArray, rowIndex;
            option = rowType === 'income' ? 'allIncome' : 'allExpense';
            idArray = allData.allItems[option].map(function (current) {
                return current.id;
            });
            rowIndex = idArray.indexOf(rowID);
            if (rowIndex !== -1) {
                allData.allItems[option].splice(rowIndex, 1);
            }

        }
    };

})();


//-----------------------------------------------------------------------------------------------------------------------------------------
//USER INTERFACE CONTROLLER
var userInterfaceContoller = (function () {

    var DOMStrings = {
        addOption: '.add-option',
        addDescription: '.add-description',
        addAmount: '.add-amount',
        addButton: '.add-btn',
        expenseContainer: '.container-expense-list',
        incomeContainer: '.container-income-list',
        budgetValue: '.container-top-amount',
        percentValue: '.expense-percent',
        incomeValue: '.container-top-totalincome',
        expenseValue: '.container-top-totalexpense',
        containerChart: '.container-chart',
        expensePercent: '.item-percentage',
        monthTitle: '.top-title-month'
    };

    var nodeListForEach = function (nodeList, callback) {
        for (var i = 0; i < nodeList.length; i++) {
            callback(nodeList[i], i);
        }
    };


    //Format Amount Digits Display

    var formatAmountDig = function (amount, type) {

        var numSplit, intgr, decml;
        amount = Math.abs(amount);
        amount = amount.toFixed(2);

        numSplit = amount.split('.');
        intgr = numSplit[0];
        decml = numSplit[1];
        if (intgr.length > 3) {
            intgr = intgr.substr(0, intgr.length - 3) + ',' + intgr.substr(intgr.length - 3, 3);
        }

        return ((type == 'inc' ? '+' : '-') + ' ' + intgr + '.' + decml);

    };

    return {

        //Gets the Input data from the screen
        getInputData: function () {
            return {
                inputType: document.querySelector(DOMStrings.addOption).value,
                inputDescription: document.querySelector(DOMStrings.addDescription).value,
                inputAmount: parseFloat(document.querySelector(DOMStrings.addAmount).value)
            };
        },

        //Add and Displays each row for expense and income
        displayListItem: function (obj, opt) {
            var html, newHtml, containerClass;

            if (opt == 'inc') {
                containerClass = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item-description">%description%</div><div class="container-right clearfix"><div class="item-value">%amount%</div><div class="item-delete"><button class="item-delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (opt === 'exp') {
                containerClass = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item-description">%description%</div><div class="container-right clearfix"><div class="item-value">%amount%</div><div class="item-percentage">80%</div><div class="item-delete"><button class="item-delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%amount%', formatAmountDig(obj.amount, opt));

            document.querySelector(containerClass).insertAdjacentHTML('beforeend', newHtml);

        },

        //Deletes the selected row for expense and income
        deleteListItem: function (parentID) {
            var parentElem = document.getElementById(parentID);
            parentElem.parentNode.removeChild(parentElem);

        },


        //Update the total income and expense , the budget and percentage on the top panel
        displayBudget: function (obj) {
            var type;
            type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DOMStrings.budgetValue).textContent = formatAmountDig(obj.budget, type);
            document.querySelector(DOMStrings.incomeValue).textContent = formatAmountDig(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expenseValue).textContent = formatAmountDig(obj.totalExpense, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentValue).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMStrings.percentValue).textContent = '---';
            }
        },


        //Update the Percentages on each expenses 
        displayPercentages: function (percentages) {
            var percentFields;
            percentFields = document.querySelectorAll(DOMStrings.expensePercent);

            nodeListForEach(percentFields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        },


        //Clearing the description and amount textboxes after adding them.
        clearInputField: function () {
            document.querySelector(DOMStrings.addAmount).value = "";
            document.querySelector(DOMStrings.addDescription).value = "";
            document.querySelector(DOMStrings.addDescription).focus();
        },


        //Displaying Month and Year on the Title
        displayMonthYear: function () {
            var now, month, monthArray, year;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.monthTitle).textContent = monthArray[month] + ' ' + year;
        },


        //The focus on the textboxes must be red for expenses and green for income.
        changeTypeOption: function () {

            var fields = document.querySelectorAll(
                DOMStrings.addOption + ',' +
                DOMStrings.addDescription + ',' +
                DOMStrings.addAmount);
            
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-input-focus');
            });
            
            document.querySelector(DOMStrings.addButton).classList.toggle('red-color');
            document.querySelector(DOMStrings.addOption).classList.toggle('red-color');
        },


        getDOMStrings: function () {
            return DOMStrings;
        }
    };
})();



//-----------------------------------------------------------------------------------------------------------------------------------------
//GLOBAL APP CONTROLLER
var contoller = (function (budgetCtrl, userCtrl) {


    //Setup for the event listeners
    var setEventListeners = function () {

        var DOMStrings = userCtrl.getDOMStrings();

        document.querySelector(DOMStrings.addButton).addEventListener('click', addAmount);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                addAmount();
            }
        });
        document.querySelector(DOMStrings.containerChart).addEventListener('click', deleteRecord);
        document.querySelector(DOMStrings.addOption).addEventListener('change', userCtrl.changeTypeOption);
    };


    var addAmount = function () {
        var inputs, newItem;
        inputs = userCtrl.getInputData();
        if ((inputs.inputDescription !== "") && (!isNaN(inputs.inputAmount)) && (inputs.inputAmount > 0)) {

            newItem = budgetCtrl.insertItem(inputs.inputType, inputs.inputDescription, inputs.inputAmount);
            userCtrl.displayListItem(newItem, inputs.inputType);
            userCtrl.clearInputField();
            updateBudget();
            updatePercentage();
        }
    };


    var deleteRecord = function (event) {
        var rowID, rowName, rowType, rowNameSplit;
        rowName = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (rowName) {
            rowNameSplit = rowName.split('-');
            rowType = rowNameSplit[0];
            rowID = parseInt(rowNameSplit[1]);
            budgetCtrl.deleteDataValue(rowType, rowID);
            userCtrl.deleteListItem(rowName);
            updateBudget();
            updatePercentage();
        }

    };

    var updateBudget = function () {
        var budget;
        budgetCtrl.calculateBudget();
        budget = budgetCtrl.getBudget();
        userCtrl.displayBudget(budget);
    };


    var updatePercentage = function () {
        var percent;
        budgetCtrl.calculatePercentages();
        percent = budgetCtrl.getPercentages();
        userCtrl.displayPercentages(percent);
    };

    return {

        init: function () {
            userCtrl.displayMonthYear();
            userCtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalIncome: 0,
                totalExpense: 0
            });

            setEventListeners();

        }
    };


})(budgetContoller, userInterfaceContoller);


contoller.init();