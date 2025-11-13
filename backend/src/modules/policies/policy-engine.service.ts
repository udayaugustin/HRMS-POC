import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Policy Engine Service
 * Handles the evaluation of policy rules and conditions
 */
@Injectable()
export class PolicyEngineService {
  /**
   * Evaluate a policy against a given context
   * @param policyConfig - The policy configuration JSON
   * @param context - The context data to evaluate against
   * @returns Evaluation result
   */
  evaluateRules(
    policyConfig: Record<string, any>,
    context: Record<string, any>,
  ): {
    passed: boolean;
    results: Array<{ rule: string; passed: boolean; message?: string }>;
    value?: any;
  } {
    if (!policyConfig || !policyConfig.rules) {
      throw new BadRequestException('Invalid policy configuration: rules are required');
    }

    const results: Array<{ rule: string; passed: boolean; message?: string }> = [];
    let allPassed = true;

    // Evaluate each rule
    for (const rule of policyConfig.rules) {
      const ruleResult = this.evaluateRule(rule, context);
      results.push(ruleResult);

      if (!ruleResult.passed) {
        allPassed = false;
      }
    }

    // Calculate any derived values based on policy type
    let value = null;
    if (policyConfig.calculations && allPassed) {
      value = this.performCalculations(policyConfig.calculations, context);
    }

    return {
      passed: allPassed,
      results,
      value,
    };
  }

  /**
   * Evaluate a single rule
   * @param rule - The rule to evaluate
   * @param context - The context data
   * @returns Rule evaluation result
   */
  private evaluateRule(
    rule: Record<string, any>,
    context: Record<string, any>,
  ): { rule: string; passed: boolean; message?: string } {
    const { field, operator, value, message } = rule;

    if (!field || !operator) {
      return {
        rule: rule.name || 'unnamed',
        passed: false,
        message: 'Invalid rule configuration',
      };
    }

    const contextValue = this.getNestedValue(context, field);
    const passed = this.evaluateCondition(contextValue, operator, value);

    return {
      rule: rule.name || field,
      passed,
      message: passed ? undefined : message || `Rule '${rule.name || field}' failed`,
    };
  }

  /**
   * Evaluate a condition based on operator
   * @param contextValue - The value from context
   * @param operator - The comparison operator
   * @param ruleValue - The value to compare against
   * @returns True if condition passes
   */
  private evaluateCondition(contextValue: any, operator: string, ruleValue: any): boolean {
    switch (operator) {
      case 'equals':
      case '==':
        return contextValue == ruleValue;

      case 'notEquals':
      case '!=':
        return contextValue != ruleValue;

      case 'greaterThan':
      case '>':
        return Number(contextValue) > Number(ruleValue);

      case 'greaterThanOrEqual':
      case '>=':
        return Number(contextValue) >= Number(ruleValue);

      case 'lessThan':
      case '<':
        return Number(contextValue) < Number(ruleValue);

      case 'lessThanOrEqual':
      case '<=':
        return Number(contextValue) <= Number(ruleValue);

      case 'contains':
        return String(contextValue).includes(String(ruleValue));

      case 'notContains':
        return !String(contextValue).includes(String(ruleValue));

      case 'in':
        return Array.isArray(ruleValue) && ruleValue.includes(contextValue);

      case 'notIn':
        return Array.isArray(ruleValue) && !ruleValue.includes(contextValue);

      case 'between':
        if (Array.isArray(ruleValue) && ruleValue.length === 2) {
          const numValue = Number(contextValue);
          return numValue >= Number(ruleValue[0]) && numValue <= Number(ruleValue[1]);
        }
        return false;

      case 'exists':
        return contextValue !== undefined && contextValue !== null;

      case 'notExists':
        return contextValue === undefined || contextValue === null;

      case 'isEmpty':
        return !contextValue || (Array.isArray(contextValue) && contextValue.length === 0);

      case 'isNotEmpty':
        return !!contextValue && (!Array.isArray(contextValue) || contextValue.length > 0);

      case 'matches':
        try {
          const regex = new RegExp(ruleValue);
          return regex.test(String(contextValue));
        } catch (error) {
          return false;
        }

      default:
        return false;
    }
  }

  /**
   * Perform calculations based on policy configuration
   * @param calculations - Calculation configuration
   * @param context - The context data
   * @returns Calculated value
   */
  private performCalculations(calculations: Record<string, any>, context: Record<string, any>): any {
    if (!calculations.type) {
      return null;
    }

    switch (calculations.type) {
      case 'sum':
        return this.calculateSum(calculations.fields, context);

      case 'subtract':
        return this.calculateSubtract(calculations.fields, context);

      case 'multiply':
        return this.calculateMultiply(calculations.fields, context);

      case 'divide':
        return this.calculateDivide(calculations.fields, context);

      case 'percentage':
        return this.calculatePercentage(calculations.base, calculations.rate, context);

      case 'formula':
        return this.evaluateFormula(calculations.formula, context);

      default:
        return null;
    }
  }

  /**
   * Calculate sum of fields
   */
  private calculateSum(fields: string[], context: Record<string, any>): number {
    return fields.reduce((sum, field) => {
      const value = this.getNestedValue(context, field);
      return sum + (Number(value) || 0);
    }, 0);
  }

  /**
   * Calculate subtraction
   */
  private calculateSubtract(fields: string[], context: Record<string, any>): number {
    if (fields.length < 2) return 0;

    const firstValue = Number(this.getNestedValue(context, fields[0])) || 0;
    return fields.slice(1).reduce((result, field) => {
      const value = this.getNestedValue(context, field);
      return result - (Number(value) || 0);
    }, firstValue);
  }

  /**
   * Calculate multiplication
   */
  private calculateMultiply(fields: string[], context: Record<string, any>): number {
    return fields.reduce((product, field) => {
      const value = this.getNestedValue(context, field);
      return product * (Number(value) || 1);
    }, 1);
  }

  /**
   * Calculate division
   */
  private calculateDivide(fields: string[], context: Record<string, any>): number {
    if (fields.length < 2) return 0;

    const firstValue = Number(this.getNestedValue(context, fields[0])) || 0;
    const divisor = Number(this.getNestedValue(context, fields[1])) || 1;

    return divisor !== 0 ? firstValue / divisor : 0;
  }

  /**
   * Calculate percentage
   */
  private calculatePercentage(baseField: string, rateField: string, context: Record<string, any>): number {
    const base = Number(this.getNestedValue(context, baseField)) || 0;
    const rate = Number(this.getNestedValue(context, rateField)) || 0;

    return (base * rate) / 100;
  }

  /**
   * Evaluate a formula (simple implementation)
   * @param formula - Formula string with placeholders like {fieldName}
   * @param context - The context data
   * @returns Calculated result
   */
  private evaluateFormula(formula: string, context: Record<string, any>): number {
    try {
      // Replace placeholders with actual values
      let evaluableFormula = formula;
      const placeholders = formula.match(/\{([^}]+)\}/g);

      if (placeholders) {
        for (const placeholder of placeholders) {
          const field = placeholder.replace(/[{}]/g, '');
          const value = this.getNestedValue(context, field);
          evaluableFormula = evaluableFormula.replace(placeholder, String(value || 0));
        }
      }

      // Note: In production, use a safe expression evaluator library
      // This is a simplified implementation
      // eslint-disable-next-line no-eval
      return eval(evaluableFormula);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get nested value from object using dot notation
   * @param obj - The object
   * @param path - Dot-notation path (e.g., 'user.profile.age')
   * @returns The value at the path
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Calculate leave balance based on policy
   * @param policyConfig - Leave policy configuration
   * @param context - Employee and leave context
   * @returns Calculated leave balance details
   */
  calculateLeaveBalance(
    policyConfig: Record<string, any>,
    context: {
      employmentStartDate: Date;
      currentYear: number;
      existingBalance?: number;
      usedLeaves?: number;
      pendingLeaves?: number;
    },
  ): {
    entitlement: number;
    accrued: number;
    available: number;
    details: Record<string, any>;
  } {
    const { accrualType, accrualRate, maxAccrual, carryForwardLimit } = policyConfig;

    let entitlement = 0;
    let accrued = 0;

    // Calculate entitlement based on accrual type
    switch (accrualType) {
      case 'annual':
        entitlement = Number(accrualRate) || 0;
        accrued = entitlement;
        break;

      case 'monthly':
        const monthsWorked = this.calculateMonthsWorked(context.employmentStartDate, context.currentYear);
        entitlement = Number(accrualRate) || 0;
        accrued = monthsWorked * entitlement;
        break;

      case 'prorated':
        const daysWorked = this.calculateDaysWorked(context.employmentStartDate, context.currentYear);
        const totalDaysInYear = this.isLeapYear(context.currentYear) ? 366 : 365;
        entitlement = Number(accrualRate) || 0;
        accrued = (daysWorked / totalDaysInYear) * entitlement;
        break;

      default:
        entitlement = Number(accrualRate) || 0;
        accrued = entitlement;
    }

    // Apply maximum accrual limit
    if (maxAccrual && accrued > maxAccrual) {
      accrued = maxAccrual;
    }

    // Calculate available balance
    const openingBalance = context.existingBalance || 0;
    const used = context.usedLeaves || 0;
    const pending = context.pendingLeaves || 0;
    const available = openingBalance + accrued - used - pending;

    return {
      entitlement,
      accrued,
      available: Math.max(0, available),
      details: {
        openingBalance,
        used,
        pending,
        carryForwardLimit: carryForwardLimit || 0,
      },
    };
  }

  /**
   * Calculate months worked in a given year
   */
  private calculateMonthsWorked(employmentStartDate: Date, year: number): number {
    const startDate = new Date(employmentStartDate);
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const effectiveStart = startDate > yearStart ? startDate : yearStart;
    const effectiveEnd = yearEnd;

    if (effectiveStart > effectiveEnd) {
      return 0;
    }

    const monthsDiff =
      (effectiveEnd.getFullYear() - effectiveStart.getFullYear()) * 12 +
      (effectiveEnd.getMonth() - effectiveStart.getMonth()) + 1;

    return Math.max(0, Math.min(12, monthsDiff));
  }

  /**
   * Calculate days worked in a given year
   */
  private calculateDaysWorked(employmentStartDate: Date, year: number): number {
    const startDate = new Date(employmentStartDate);
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const effectiveStart = startDate > yearStart ? startDate : yearStart;
    const effectiveEnd = yearEnd;

    if (effectiveStart > effectiveEnd) {
      return 0;
    }

    const timeDiff = effectiveEnd.getTime() - effectiveStart.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    return daysDiff;
  }

  /**
   * Check if a year is a leap year
   */
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }
}
