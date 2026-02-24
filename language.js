// Language System
// Store current language in localStorage

// Get current language (default to English)
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

// Set language
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    applyLanguage();
}

// Toggle between languages
function toggleLanguage() {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
}

// Translation dictionary
const translations = {
    // Header
    'header.title': {
        en: '2026 Chinese For Christ Church<br>Summer Retreat',
        zh: '2026 中华归主教会夏季退修会'
    },
    'header.subtitle': {
        en: '2026 Chinese For Christ Church Summer Retreat',
        zh: '2026 中华归主教会夏季退修会'
    },
    
    // Auth page
    'auth.signInGoogle': {
        en: 'Sign in with Google',
        zh: '使用谷歌登录'
    },
    'auth.phoneNumber': {
        en: 'Phone Number',
        zh: '电话号码'
    },
    'auth.sendCode': {
        en: 'Send Verification Code',
        zh: '发送验证码'
    },
    'auth.verificationCode': {
        en: 'Verification Code',
        zh: '验证码'
    },
    'auth.verificationHint': {
        en: 'Enter the 6-digit code sent to your phone',
        zh: '输入发送到您手机的6位数字验证码'
    },
    'auth.verifySignIn': {
        en: 'Verify & Sign In',
        zh: '验证并登录'
    },
    'auth.cancel': {
        en: 'Cancel',
        zh: '取消'
    },
    'auth.processing': {
        en: 'Processing...',
        zh: 'Processing...'
    },
    'auth.welcome': {
        en: 'Welcome!',
        zh: '欢迎！'
    },
    'auth.enterInfo': {
        en: 'Please enter your information to complete sign-up:',
        zh: '请输入您的信息以完成注册：'
    },
    'auth.fullName': {
        en: 'Full Name',
        zh: '全名'
    },
    'auth.emailAddress': {
        en: 'Email Address',
        zh: '电子邮箱'
    },
    'auth.continue': {
        en: 'Continue',
        zh: '继续'
    },
    'auth.error': {
        en: 'Error',
        zh: '错误'
    },
    'auth.ok': {
        en: 'OK',
        zh: '确定'
    },
    
    // Dashboard
    'dashboard.welcomeBack': {
        en: 'Welcome back',
        zh: '欢迎回来'
    },
    'dashboard.signOut': {
        en: 'Sign Out',
        zh: '登出'
    },
    'dashboard.createAnotherIndividual': {
        en: '+ Create Another Individual Registration',
        zh: '+ 创建另一个个人报名'
    },
    'dashboard.addMoreMembers': {
        en: '+ Add More Members',
        zh: '+ 添加更多成员'
    },
    'dashboard.createAnotherFamily': {
        en: '+ Create Another Family Registration',
        zh: '+ 创建另一个家庭报名'
    },
    'dashboard.individualReg': {
        en: 'Individual Registrations',
        zh: '个人报名'
    },
    'dashboard.familyReg': {
        en: 'Family Registrations',
        zh: '家庭报名'
    },
    'dashboard.individualSection': {
        en: 'Individual Registrations',
        zh: '个人报名'
    },
    'dashboard.familySection': {
        en: 'Family Registrations',
        zh: '家庭报名'
    },
    'dashboard.noIndividual': {
        en: "You haven't registered individually yet.",
        zh: '您还没有个人报名。'
    },
    'dashboard.createIndividual': {
        en: 'Create Individual Registration',
        zh: '创建个人报名'
    },
    'dashboard.noFamily': {
        en: "You're not part of any family registration yet.",
        zh: '您还没有加入任何家庭报名。'
    },
    'dashboard.createFamily': {
        en: 'Create Family Registration',
        zh: '创建家庭报名'
    },
    'dashboard.loading': {
        en: 'Loading your registrations...',
        zh: 'Loading your registrations...'
    },
    'dashboard.signOutTitle': {
        en: 'Sign Out',
        zh: '登出'
    },
    'dashboard.signOutConfirm': {
        en: 'Are you sure you want to sign out?',
        zh: '您确定要登出吗？'
    },
    'dashboard.editReg': {
        en: 'Edit Registration',
        zh: '编辑报名'
    },
    'dashboard.name': {
        en: 'Name',
        zh: '姓名'
    },
    'dashboard.phone': {
        en: 'Phone',
        zh: '电话'
    },
    'dashboard.email': {
        en: 'Email',
        zh: '电子邮箱'
    },
    'dashboard.address': {
        en: 'Address',
        zh: '地址'
    },
    'dashboard.saveChanges': {
        en: 'Save Changes',
        zh: '保存更改'
    },
    'dashboard.deleteReg': {
        en: 'Delete Registration',
        zh: '删除报名'
    },
    'dashboard.deleteConfirm': {
        en: 'Are you sure you want to delete this registration?',
        zh: '您确定要删除这个报名吗？'
    },
    'dashboard.delete': {
        en: 'Delete',
        zh: '删除'
    },
    'dashboard.deleteFamily': {
        en: 'Delete Entire Family',
        zh: '删除整个家庭'
    },
    'dashboard.deleteFamilyConfirm': {
        en: 'Are you sure you want to delete this family?',
        zh: '您确定要删除这个家庭吗？'
    },
    'dashboard.deleteFamilyWarning': {
        en: 'This will permanently delete:',
        zh: '这将永久删除：'
    },
    'dashboard.deleteFamilyItems1': {
        en: 'The family registration',
        zh: '家庭报名'
    },
    'dashboard.deleteFamilyItems2': {
        en: 'All family members',
        zh: '所有家庭成员'
    },
    'dashboard.deleteFamilyItems3': {
        en: 'This action cannot be undone',
        zh: '此操作无法撤销'
    },
    'dashboard.deleteEverything': {
        en: 'Yes, Delete Everything',
        zh: '确认删除'
    },
    'dashboard.quitFamily': {
        en: 'Quit Family',
        zh: '退出家庭'
    },
    'dashboard.quitFamilyConfirm': {
        en: 'Are you sure you want to quit this family?',
        zh: '您确定要退出这个家庭吗？'
    },
    'dashboard.quitFamilyItems1': {
        en: 'All your registrations in this family',
        zh: '您在此家庭中的所有报名'
    },
    'dashboard.quitFamilyItems2': {
        en: 'Other family members will remain in the family',
        zh: '其他家庭成员将保留在家庭中'
    },
    'dashboard.quitFamilyConfirmBtn': {
        en: 'Yes, Quit Family',
        zh: '确认退出'
    },
    'dashboard.success': {
        en: 'Success',
        zh: '成功'
    },
    'dashboard.successMessage': {
        en: 'Operation completed successfully',
        zh: '操作成功完成'
    },
    
    // Register page
    'register.backToDashboard': {
        en: '← Back to Dashboard',
        zh: '← 返回主页'
    },
    'register.enterName': {
        en: 'Enter Your Name',
        zh: '输入您的姓名'
    },
    'register.fullName': {
        en: 'Full Name',
        zh: '全名'
    },
    'register.back': {
        en: 'Back',
        zh: '返回'
    },
    'register.continue': {
        en: 'Continue',
        zh: '继续'
    },
    'register.regDetails': {
        en: 'Registration Details',
        zh: '报名详情'
    },
    'register.yourId': {
        en: 'Your ID:',
        zh: '您的ID：'
    },
    'register.phoneNumber': {
        en: 'Phone Number',
        zh: '电话号码'
    },
    'register.emailAddress': {
        en: 'Email Address',
        zh: '电子邮箱'
    },
    'register.homeAddress': {
        en: 'Home Address',
        zh: '家庭地址'
    },
    'register.submitReg': {
        en: 'Submit Registration',
        zh: '提交报名'
    },
    'register.familyReg': {
        en: 'Family Registration',
        zh: '家庭报名'
    },
    'register.chooseOption': {
        en: 'Choose an option below:',
        zh: '请选择以下选项：'
    },
    'register.joinFamily': {
        en: 'Join a Family',
        zh: '加入家庭'
    },
    'register.joinFamilyDesc': {
        en: 'Enter Family ID or member email to join',
        zh: '输入家庭ID或成员邮箱以加入'
    },
    'register.createNewFamily': {
        en: 'New here? Create a New Family',
        zh: '新用户？创建新家庭'
    },
    'register.createNewFamilyDesc': {
        en: 'Start a new family registration',
        zh: '开始新的家庭报名'
    },
    'register.joinExisting': {
        en: 'Join Existing Family',
        zh: '加入现有家庭'
    },
    'register.findFamilyDesc': {
        en: 'Find your family by entering either the Family ID or a family member\'s email.',
        zh: '通过输入家庭ID或家庭成员的电子邮箱来查找您的家庭。'
    },
    'register.familyId': {
        en: 'Family ID',
        zh: '家庭ID'
    },
    'register.askFamilyId': {
        en: 'Ask your family member for this ID',
        zh: '向您的家庭成员询问此ID'
    },
    'register.memberEmail': {
        en: 'Family Member\'s Email',
        zh: '家庭成员的电子邮箱'
    },
    'register.memberEmailDesc': {
        en: 'Enter the email of someone already registered in the family',
        zh: '输入已在家庭中报名的成员的电子邮箱'
    },
    'register.findFamily': {
        en: 'Find Family',
        zh: '查找家庭'
    },
    'register.multipleFamilies': {
        en: 'Multiple Families Found',
        zh: '找到多个家庭'
    },
    'register.selectFamily': {
        en: 'We found multiple families with a member using that email. Please select which family you\'d like to join:',
        zh: '我们找到了多个使用该电子邮箱的家庭。请选择您想加入的家庭：'
    },
    'register.confirmFamily': {
        en: 'Confirm Family',
        zh: '确认家庭'
    },
    'register.confirmFamilyDesc': {
        en: 'Is this the correct family?',
        zh: '这是正确的家庭吗？'
    },
    'register.joinThisFamily': {
        en: 'Yes, Join This Family',
        zh: '是的，加入此家庭'
    },
    'register.createFamilyReg': {
        en: 'Create Family Registration',
        zh: '创建家庭报名'
    },
    'register.createFamilyDesc': {
        en: 'Enter the primary contact\'s name for your family. A unique Family ID will be generated for you.',
        zh: '输入您家庭的主要联系人姓名。系统将为您生成唯一的家庭ID。'
    },
    'register.primaryContact': {
        en: 'Primary Contact / Head of Family',
        zh: '主要联系人/户主'
    },
    'register.familyIdHint': {
        en: 'This will be used to create your Family ID',
        zh: '此信息将用于创建您的家庭ID'
    },
    'register.createAndContinue': {
        en: 'Create Family & Continue',
        zh: '创建家庭并继续'
    },
    'register.familyIdLabel': {
        en: 'Family ID:',
        zh: '家庭ID：'
    },
    'register.shareId': {
        en: 'Share this ID with family members so they can add themselves later!',
        zh: '与家庭成员分享此ID，以便他们日后添加自己！'
    },
    'register.familyMembers': {
        en: 'Family Members',
        zh: '家庭成员'
    },
    'register.noMembers': {
        en: 'No members added yet. Click "Add Family Member" to get started.',
        zh: '尚未添加成员。点击"添加家庭成员"开始。'
    },
    'register.addMember': {
        en: '+ Add Family Member',
        zh: '+ 添加家庭成员'
    },
    'register.addNewMember': {
        en: 'Add New Family Member',
        zh: '添加新家庭成员'
    },
    'register.completeReg': {
        en: 'Complete Registration',
        zh: '完成报名'
    },
    'register.regComplete': {
        en: 'Registration Complete!',
        zh: '报名完成！'
    },
    'register.backToDashboardBtn': {
        en: 'Back to Dashboard',
        zh: '返回主页'
    },
    'register.signOut': {
        en: 'Sign Out',
        zh: '登出'
    },
    'register.signOutConfirm': {
        en: 'Are you sure you want to sign out?',
        zh: '您确定要登出吗？'
    },
    'register.error': {
        en: 'Error',
        zh: '错误'
    },
    'register.errorMessage': {
        en: 'An error occurred',
        zh: '发生错误'
    },
    
    // Common
    'common.or': {
        en: 'OR',
        zh: 'OR'
    },
    'common.cancel': {
        en: 'Cancel',
        zh: '取消'
    },
    'common.ok': {
        en: 'OK',
        zh: '确定'
    }
};

// Get translation
function t(key) {
    const lang = getCurrentLanguage();
    return translations[key] ? translations[key][lang] : key;
}

// Apply language to current page
function applyLanguage() {
    const lang = getCurrentLanguage();
    
    // Update all elements with data-i18n attribute (for text content)
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.innerHTML = translations[key][lang];
        }
    });
    
    // Update all elements with data-i18n-placeholder attribute (for placeholders)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            element.placeholder = translations[key][lang];
        }
    });
    
    // Update language toggle button
    const langBtn = document.getElementById('language-toggle');
    if (langBtn) {
        langBtn.textContent = lang === 'en' ? '中文' : 'EN';
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
});

// Make functions globally available
window.toggleLanguage = toggleLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.applyLanguage = applyLanguage;
window.t = t;
