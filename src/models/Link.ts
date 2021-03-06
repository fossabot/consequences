import Action from '../interfaces/Action';
import Condition from '../interfaces/Condition';
import UserInput from '../interfaces/UserInput';

/**
 * A step in a `Chain`
 */
export default class Link {
  public readonly id: string;

  /**
   * A array of tuples containing conditions and links. When
   * this link is evaluated each of the conditions will be check. If
   * the condition returns `true` the link will be evaluated.
   */
  public readonly conditionalLinks: Array<[Condition, UserInput.Value[], Link]>;

  /**
   * An array of actions that will be performed when this link is reached
   *
   * @type {Action[]}
   */
  public readonly actions: Array<[Action, UserInput.Value[]]>;

  constructor(id: string, conditionalLinks: Array<[Condition, UserInput.Value[], Link]>, actions: Array<[Action, UserInput.Value[]]>) {
    this.id = id;
    this.conditionalLinks = conditionalLinks;
    this.actions = actions;
  }

  public async evaluate() {
    for (const [action, userInputs] of this.actions) {
      await action.perform(userInputs);
    }

    for (const [condition, userInputs, link] of this.conditionalLinks) {
      if (await condition.evaluate(userInputs)) {
        await link.evaluate();
      }
    }
  }

}
