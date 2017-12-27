import { expect } from 'chai';
import * as sinon from 'sinon';

import BooleanCondition from '../../conditionals/BooleanCondition';
import VariableValueChangedEvent from '../../events/VariableValueChangedEvent';
import Variable from '../../interfaces/Variable';
import Variables from '../Variables';

describe('Variables', () => {
  context('ReadOnly', () => {
      context('constructor', () => {
      it('should store all values passed to the constructor', async () => {
        const changeEvent = new VariableValueChangedEvent(
          {
            uniqueId: 'event-1',
            lastTriggered: null,
          },
          new Variables.ReadOnly({
            uniqueId: 'nested-variable-1',
            name: 'Nested Variable 1',
            startingValue: '',
          }),
        );

        const options = {
          uniqueId: 'variable-1',
          name: 'Variable 1',
          startingValue: '',
          conditions: [
            new BooleanCondition.True(),
          ],
          events: [
            changeEvent,
          ],
        };

        const variable = new Variables.ReadOnly(options);

        expect(variable.uniqueId).to.equal(options.uniqueId);
        expect(variable.name).to.equal(options.name);
        expect(await variable.retrieveValue()).to.equal(options.startingValue);
        expect(variable.conditions).to.deep.equal(options.conditions);
        expect(variable.events).to.deep.equal(options.events);
      });
    });
  });

  context('ReadWrite', () => {
    context('#updateValue(newValue:)', () => {
      it('should update the value immediately', async () => {
        const variable = new Variables.ReadWrite({
          uniqueId: 'variable-1',
          name: 'Variable 1',
          startingValue: '',
        });

        const newValue = 'new value';

        await variable.updateValue(newValue);

        const valueAfterUpdate = await variable.retrieveValue();

        expect(valueAfterUpdate).to.equal(newValue);
      });

      it('should call all listeners with the new value', async () => {
        const variable = new Variables.ReadWrite({
          uniqueId: 'variable-1',
          name: 'Variable 1',
          startingValue: '',
        });

        const callbacks = [
          sinon.spy(),
          sinon.spy(),
          sinon.spy(),
          sinon.spy(),
          sinon.spy(),
        ];

        callbacks.forEach(variable.addChangeEventListener, variable);

        const newValue = 'new value';

        await variable.updateValue(newValue);

        callbacks.forEach(callback => {
          expect(callback.calledWith(newValue)).to.be.true;
        });
      });

      it('should not call removed listeners', async () => {
        const variable = new Variables.ReadWrite({
          uniqueId: 'variable-1',
          name: 'Variable 1',
          startingValue: '',
        });

        const callbackToNotBeCalled = sinon.spy();

        variable.addChangeEventListener(callbackToNotBeCalled);

        const callbacksToBeCalled = [
          sinon.spy(),
          sinon.spy(),
          sinon.spy(),
          sinon.spy(),
          sinon.spy(),
        ];

        callbacksToBeCalled.forEach(variable.addChangeEventListener, variable);

        variable.removeChangeEventListener(callbackToNotBeCalled);

        const newValue = 'new value';

        await variable.updateValue(newValue);

        expect(callbackToNotBeCalled.notCalled).to.be.true;

        callbacksToBeCalled.forEach(callback => {
          expect(callback.calledWith(newValue)).to.be.true;
        });
      });
    });
  });
});
