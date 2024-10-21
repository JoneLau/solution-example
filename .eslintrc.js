module.exports = {
    // 此即根目录
    root: true,

    // 代码运行环境，包含预定义全局变量
    env: {
        browser: true,
        node: true,
    },

    // 解析器
    parser: "@typescript-eslint/parser",

    // 插件，引入规则支持
    plugins: [
        "@typescript-eslint",
    ],

    // 扩展，现成配置方案的最佳实践
    // 多个扩展中有相同的规则，以后面引入的扩展为准
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],

    rules: {
        // 行末需要分号
        "semi": ["warn", "always", { "omitLastInOneLineBlock": true }],

        // 必须使用===
        "eqeqeq": "error",

        // 常量不强制使用const
        "prefer-const": "off",

        // 警告空方法
        "@typescript-eslint/no-empty-function": "warn",

        // 警告空接口
        "@typescript-eslint/no-empty-interface": "warn",

        // 禁止多个空行
        "no-multiple-empty-lines": ["error", { "max": 1, "maxBOF": 1, "maxEOF": 0 }],

        // 允许数组间隔
        "no-sparse-arrays": "off",

        // 禁止写any
        "@typescript-eslint/no-explicit-any": "error",

        // 方法不能超过5个参数，多出则写为接口
        "max-params": ["error", 5],

        // 不用写public
        "@typescript-eslint/explicit-member-accessibility": ["warn", { accessibility: "no-public" }],

        // 对象字段使用简写语法
        "object-shorthand": "error",

        // 多个变量声明禁止写在一行
        "one-var": ["error", "never"],

        // 多行末尾逗号保持一致
        "comma-dangle": ["warn", "always-multiline"],
    }
}