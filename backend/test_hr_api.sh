#!/bin/bash

# HR API Testing Script
# This script provides easy testing of HR endpoints

# Configuration
BASE_URL="http://localhost:8000/api"
AUTH_TOKEN="${AUTH_TOKEN:-YOUR_AUTH_TOKEN_HERE}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if auth token is set
check_auth_token() {
    if [ "$AUTH_TOKEN" = "YOUR_AUTH_TOKEN_HERE" ]; then
        print_warning "AUTH_TOKEN not set. Please set it before running tests:"
        echo "export AUTH_TOKEN='your_actual_token'"
        exit 1
    fi
}

# 1. Create Manager
test_create_manager() {
    print_header "1. CREATE MANAGER"
    
    TIMESTAMP=$(date +%s)
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/hr/manager" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{
            \"name\": \"John Manager $TIMESTAMP\",
            \"email\": \"john.manager.$TIMESTAMP@company.com\",
            \"password\": \"SecurePass@123\",
            \"department\": \"Sales\",
            \"employeeId\": \"MGR-$TIMESTAMP\"
        }")
    
    echo "$RESPONSE" | jq '.'
    
    # Extract manager ID for later use
    MANAGER_ID=$(echo "$RESPONSE" | jq -r '.data.id // empty')
    MANAGER_EMPLOYEE_ID=$(echo "$RESPONSE" | jq -r '.data.employeeId // empty')
    
    if [ -z "$MANAGER_ID" ]; then
        print_error "Failed to create manager"
        return 1
    fi
    
    print_success "Manager created: $MANAGER_EMPLOYEE_ID (ID: $MANAGER_ID)"
    echo "MANAGER_ID=$MANAGER_ID" > /tmp/hr_test_vars.sh
    echo "MANAGER_EMPLOYEE_ID=$MANAGER_EMPLOYEE_ID" >> /tmp/hr_test_vars.sh
}

# 2. Create Employee
test_create_employee() {
    print_header "2. CREATE EMPLOYEE"
    
    # Source saved variables
    if [ -f /tmp/hr_test_vars.sh ]; then
        source /tmp/hr_test_vars.sh
    fi
    
    if [ -z "$MANAGER_ID" ]; then
        print_error "Manager ID not found. Create a manager first."
        return 1
    fi
    
    TIMESTAMP=$(date +%s)
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/hr/employee" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{
            \"name\": \"Jane Doe $TIMESTAMP\",
            \"email\": \"jane.doe.$TIMESTAMP@company.com\",
            \"password\": \"SecurePass@123\",
            \"department\": \"Sales\",
            \"position\": \"Sales Executive\",
            \"role\": \"EMPLOYEE\",
            \"managerId\": \"$MANAGER_ID\",
            \"employeeId\": \"EMP-$TIMESTAMP\"
        }")
    
    echo "$RESPONSE" | jq '.'
    
    EMPLOYEE_ID=$(echo "$RESPONSE" | jq -r '.data.id // empty')
    EMPLOYEE_EMPLOYEE_ID=$(echo "$RESPONSE" | jq -r '.data.employeeId // empty')
    
    if [ -z "$EMPLOYEE_ID" ]; then
        print_error "Failed to create employee"
        return 1
    fi
    
    print_success "Employee created: $EMPLOYEE_EMPLOYEE_ID (ID: $EMPLOYEE_ID)"
    echo "EMPLOYEE_ID=$EMPLOYEE_ID" >> /tmp/hr_test_vars.sh
    echo "EMPLOYEE_EMPLOYEE_ID=$EMPLOYEE_EMPLOYEE_ID" >> /tmp/hr_test_vars.sh
}

# 3. Get All Managers
test_get_managers() {
    print_header "3. GET ALL MANAGERS"
    
    RESPONSE=$(curl -s -X GET "$BASE_URL/hr/managers" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$RESPONSE" | jq '.'
}

# 4. Get All Employees
test_get_employees() {
    print_header "4. GET ALL EMPLOYEES"
    
    RESPONSE=$(curl -s -X GET "$BASE_URL/hr/employees" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$RESPONSE" | jq '.'
}

# 5. Get Specific Manager
test_get_manager() {
    print_header "5. GET SPECIFIC MANAGER"
    
    if [ -f /tmp/hr_test_vars.sh ]; then
        source /tmp/hr_test_vars.sh
    fi
    
    if [ -z "$MANAGER_EMPLOYEE_ID" ]; then
        print_error "Manager Employee ID not found"
        return 1
    fi
    
    RESPONSE=$(curl -s -X GET "$BASE_URL/hr/manager/$MANAGER_EMPLOYEE_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$RESPONSE" | jq '.'
}

# 6. Get Specific Employee
test_get_employee() {
    print_header "6. GET SPECIFIC EMPLOYEE"
    
    if [ -f /tmp/hr_test_vars.sh ]; then
        source /tmp/hr_test_vars.sh
    fi
    
    if [ -z "$EMPLOYEE_EMPLOYEE_ID" ]; then
        print_error "Employee Employee ID not found"
        return 1
    fi
    
    RESPONSE=$(curl -s -X GET "$BASE_URL/hr/employee/$EMPLOYEE_EMPLOYEE_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$RESPONSE" | jq '.'
}

# 7. Update Manager
test_update_manager() {
    print_header "7. UPDATE MANAGER"
    
    if [ -f /tmp/hr_test_vars.sh ]; then
        source /tmp/hr_test_vars.sh
    fi
    
    if [ -z "$MANAGER_EMPLOYEE_ID" ]; then
        print_error "Manager Employee ID not found"
        return 1
    fi
    
    RESPONSE=$(curl -s -X PUT "$BASE_URL/hr/manager/$MANAGER_EMPLOYEE_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{
            \"name\": \"John Manager Updated\",
            \"position\": \"Senior Manager\",
            \"department\": \"Sales\"
        }")
    
    echo "$RESPONSE" | jq '.'
}

# 8. Update Employee
test_update_employee() {
    print_header "8. UPDATE EMPLOYEE"
    
    if [ -f /tmp/hr_test_vars.sh ]; then
        source /tmp/hr_test_vars.sh
    fi
    
    if [ -z "$EMPLOYEE_EMPLOYEE_ID" ]; then
        print_error "Employee Employee ID not found"
        return 1
    fi
    
    RESPONSE=$(curl -s -X PUT "$BASE_URL/hr/employee/$EMPLOYEE_EMPLOYEE_ID" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{
            \"name\": \"Jane Doe Updated\",
            \"position\": \"Senior Sales Executive\",
            \"department\": \"Marketing\"
        }")
    
    echo "$RESPONSE" | jq '.'
}

# 9. Delete Employee
test_delete_employee() {
    print_header "9. DELETE EMPLOYEE"
    
    if [ -f /tmp/hr_test_vars.sh ]; then
        source /tmp/hr_test_vars.sh
    fi
    
    if [ -z "$EMPLOYEE_EMPLOYEE_ID" ]; then
        print_error "Employee Employee ID not found"
        return 1
    fi
    
    RESPONSE=$(curl -s -X DELETE "$BASE_URL/hr/employee/$EMPLOYEE_EMPLOYEE_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$RESPONSE" | jq '.'
}

# 10. Delete Manager
test_delete_manager() {
    print_header "10. DELETE MANAGER"
    
    if [ -f /tmp/hr_test_vars.sh ]; then
        source /tmp/hr_test_vars.sh
    fi
    
    if [ -z "$MANAGER_EMPLOYEE_ID" ]; then
        print_error "Manager Employee ID not found"
        return 1
    fi
    
    RESPONSE=$(curl -s -X DELETE "$BASE_URL/hr/manager/$MANAGER_EMPLOYEE_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$RESPONSE" | jq '.'
}

# Main Menu
show_menu() {
    print_header "HR API Testing Menu"
    echo "Manager Endpoints:"
    echo "  1. Create Manager"
    echo "  2. Get All Managers"
    echo "  3. Get Specific Manager"
    echo "  4. Update Manager"
    echo "  5. Delete Manager"
    echo ""
    echo "Employee Endpoints:"
    echo "  6. Create Employee"
    echo "  7. Get All Employees"
    echo "  8. Get Specific Employee"
    echo "  9. Update Employee"
    echo "  10. Delete Employee"
    echo ""
    echo "Complete Tests:"
    echo "  11. Run Full Test Sequence (Create Manager → Create Employee → Read → Update → Delete)"
    echo "  12. Test Manager Only"
    echo "  13. Test Employee Only"
    echo ""
    echo "  0. Exit"
    echo ""
}

# Full test sequence
run_full_test() {
    print_header "Running Full Test Sequence"
    test_create_manager && \
    test_create_employee && \
    test_get_manager && \
    test_get_employee && \
    test_update_manager && \
    test_update_employee && \
    test_delete_employee && \
    test_delete_manager && \
    print_success "All tests completed!"
}

# Test manager only
test_manager_only() {
    test_create_manager && \
    test_get_managers && \
    test_get_manager && \
    test_update_manager && \
    test_delete_manager && \
    print_success "Manager tests completed!"
}

# Test employee only
test_employee_only() {
    test_create_manager && \
    test_create_employee && \
    test_get_employees && \
    test_get_employee && \
    test_update_employee && \
    test_delete_employee && \
    print_success "Employee tests completed!"
}

# Main loop
main() {
    check_auth_token
    
    while true; do
        show_menu
        read -p "Enter your choice (0-13): " choice
        
        case $choice in
            1) test_create_manager ;;
            2) test_get_managers ;;
            3) test_get_manager ;;
            4) test_update_manager ;;
            5) test_delete_manager ;;
            6) test_create_employee ;;
            7) test_get_employees ;;
            8) test_get_employee ;;
            9) test_update_employee ;;
            10) test_delete_employee ;;
            11) run_full_test ;;
            12) test_manager_only ;;
            13) test_employee_only ;;
            0) 
                print_success "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please try again."
                ;;
        esac
        
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
