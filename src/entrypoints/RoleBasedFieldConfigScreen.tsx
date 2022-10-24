import styles from './RoleBasedFieldConfigScreen.module.scss'
import { RenderManualFieldExtensionConfigScreenCtx } from 'datocms-plugin-sdk';
import { Canvas, Spinner, SwitchField, } from 'datocms-react-ui';
import { useEffect, useState } from 'react';
import { getClient } from '../utils'

type PropTypes = {
  ctx: RenderManualFieldExtensionConfigScreenCtx;
};

type Role = {
  id: string,
  name: string,
  hidden: boolean,
  disabled: boolean
}

type RoleMap = {
  [key: string]: Role
}

const ownerRole : Role = {
  id:'account_role',
  name: 'Owner',
  hidden:false,
  disabled:false,
}

export default function RoleBasedFieldConfigScreen({ ctx }: PropTypes) {

  const [roles, setRoles] = useState<Role[] | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [rolesValues, setRolesValues] = useState<RoleMap | undefined>()

  useEffect(() => {
    
    if(!ctx.currentUserAccessToken) 
      return setError('Access token missing!')
    
    setError(undefined)
    
    const client = getClient(ctx.currentUserAccessToken as string)

    client.roles.list().then((roles) => {
      const rls = roles.map(r => ({ id: r.id, name: r.name, hidden: false, disabled: false })) as Role[]
      rls.unshift(ownerRole)

      const rlsValues: RoleMap = {}
      rls.forEach(r => rlsValues[r.id] = r)
      setRoles(rls)
      setRolesValues(Object.keys(ctx.parameters).length ? ctx.parameters as RoleMap : rlsValues)
    }).catch((err)=> setError(err.message))

  }, [ctx.parameters, ctx.currentUserAccessToken, setRoles, setRolesValues, setError])

  useEffect(() => {
    if (typeof rolesValues === 'undefined') return
    ctx.setParameters(rolesValues).then(() => console.log('saved settings'))
  }, [rolesValues, ctx])
  
  const isReady = typeof rolesValues !== 'undefined' && typeof roles !== 'undefined';

  if(error)
    return <Canvas ctx={ctx}><div className={styles.error}>{error}</div></Canvas>
  
  if(!isReady)
    return <Canvas ctx={ctx}><Spinner/></Canvas>

  return (
    <Canvas ctx={ctx}>
      <table className={styles.settings}>
        <tr>
          <th>Role</th>
          <th>Hidden</th>
          <th>Disabled</th>
        </tr>
        {roles?.map((role) =>
          <tr>
            <td>{role.name}</td>
            <td>
              <SwitchField
                id={`hidden-${role.id}`}
                name={`hidden-${role.id}`}
                label={''}
                value={rolesValues ? rolesValues[role.id].hidden : false}
                onChange={(hidden) => setRolesValues({ ...rolesValues, [role.id]: { ...rolesValues[role.id], hidden } })}
              />
            </td>
            <td>
              <SwitchField
                id={`disabled-${role.id}`}
                name={`disabled-${role.id}`}
                label={''}
                value={rolesValues ? rolesValues[role.id].disabled : false}
                onChange={(disabled) => setRolesValues({ ...rolesValues, [role.id]: { ...rolesValues[role.id], disabled } })}
              />
            </td>
          </tr>
        )}
      </table>
    </Canvas>
  );
}