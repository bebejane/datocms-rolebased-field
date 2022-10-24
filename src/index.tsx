import 'datocms-react-ui/styles.css';
import { 
  connect, 
  IntentCtx, 
  RenderManualFieldExtensionConfigScreenCtx, 
  RenderFieldExtensionCtx,
} from 'datocms-plugin-sdk';

import { render } from './utils/render';
import ConfigScreen from './entrypoints/ConfigScreen';
import RoleBasedFieldConfigScreen from './entrypoints/RoleBasedFieldConfigScreen'
import React from 'react'
import ReactDOM from 'react-dom'

const isDev = document.location.hostname === 'localhost';

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  manualFieldExtensions(ctx: IntentCtx) {
    return [
      {
        id: 'rolesBasedField',
        name: `Role Based Field ${isDev ? ' (dev)' : ''}`,
        type: 'addon',
        fieldTypes: 'all',
        configurable: true
      },
    ];
  },
  renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
    console.log(ctx.parameters,ctx.currentRole.id);
    
    if(typeof ctx.parameters[ctx.currentRole.id] === 'object'){
      const config = ctx.parameters[ctx.currentRole.id] as any
      ctx.toggleField(ctx.fieldPath, config.hidden ? false : true)
      ctx.disableField(ctx.fieldPath, config.disabled ? true: false)
    }
    
    return null
  },
  renderManualFieldExtensionConfigScreen(fieldExtensionId: string, ctx: RenderManualFieldExtensionConfigScreenCtx) {
    ReactDOM.render(
      <React.StrictMode>
        <RoleBasedFieldConfigScreen ctx={ctx} />
      </React.StrictMode>,
      document.getElementById('root'),
    );
  },
  validateManualFieldExtensionParameters(fieldExtensionId: string, parameters: Record<string, any>) {
    const errors: Record<string, string> = {};
    
    return errors;
  },
});
