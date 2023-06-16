import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  cssText = '';
  filteredCssText = '';

  removeDuplicates() {
    const rules = this.cssText.split('}');
    const cleanedRules = rules
      .filter((rule) => rule.trim().length > 0)
      .map((rule) => rule.trim());

    const duplicatesSet = new Set<string>();
    const filteredRules = cleanedRules.filter((rule) => {
      if (duplicatesSet.has(rule)) {
        return false;
      }

      // Check if rule is a media query or special CSS rule
      if (
        rule.startsWith('@media') ||
        rule.startsWith('@supports') ||
        rule.startsWith('@import') ||
        rule.startsWith('@keyframes')
      ) {
        return !this.hasDuplicateSpecialRule(rule, cleanedRules, duplicatesSet);
      }

      duplicatesSet.add(rule);
      return true;
    });

    const filteredCssText = filteredRules.join('}\n') + '}';
    const filteredMediaQueriesText = this.extractMediaQueries(
      cleanedRules,
      filteredRules
    );

    this.filteredCssText = filteredCssText + filteredMediaQueriesText;
  }

  private extractMediaQueries(
    allRules: string[],
    filteredRules: string[]
  ): string {
    let mediaQueriesText = '';

    allRules.forEach((rule) => {
      const trimmedRule = rule.trim();

      if (
        trimmedRule.startsWith('@media') &&
        !this.ruleExistsInArray(trimmedRule, filteredRules)
      ) {
        mediaQueriesText += `${trimmedRule}\n${this.extractMediaQueryRules(
          trimmedRule,
          allRules
        )}\n\n`;
      }
    });

    return mediaQueriesText;
  }

  private ruleExistsInArray(rule: string, rulesArray: string[]): boolean {
    return rulesArray.findIndex((item) => item.trim() === rule.trim()) !== -1;
  }

  private extractMediaQueryRules(
    mediaQuery: string,
    allRules: string[]
  ): string {
    const startIndex = allRules.indexOf(mediaQuery);
    const endIndex = allRules.indexOf('}', startIndex) + 1;
    const mediaQueryRules = allRules.slice(startIndex, endIndex);

    return mediaQueryRules.join('\n');
  }

  private hasDuplicateSpecialRule(
    rule: string,
    allRules: string[],
    duplicatesSet: Set<string>
  ): boolean {
    const ruleContent = rule.split('{')[1];

    // Find duplicate special rule by comparing the rule content
    for (const duplicate of allRules) {
      if (duplicatesSet.has(duplicate)) {
        continue;
      }

      const duplicateContent = duplicate.split('{')[1];

      if (
        duplicate.startsWith(rule.split('{')[0]) &&
        duplicateContent.trim() === ruleContent.trim()
      ) {
        return true;
      }
    }

    return false;
  }
}
