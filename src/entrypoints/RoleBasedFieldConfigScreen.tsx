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
      console.log(roles);
      
      const rls = roles
        .map(r => ({ id: r.id, name: r.name, hidden: false, disabled: false }))
        .sort((a, b) => a.name > b.name ? 1 : -1) as Role[]

      rls.push(ownerRole)

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

  const allHidden = Object.keys(rolesValues).filter((k) => rolesValues[k].hidden).length === Object.keys(rolesValues).length
  const allDisabled = Object.keys(rolesValues).filter((k) => rolesValues[k].disabled).length === Object.keys(rolesValues).length

  return (
    <Canvas ctx={ctx}>
      <table className={styles.settings}>
        <tr>
          <th>Role</th>
          <th>Disabled</th>
          <th>Hidden</th>
        </tr>
        {roles?.map((role, idx) =>
          <tr>
            <td>{role.name}</td>
            <td>
              <SwitchField
                id={`disabled-${role.id}`}
                name={`disabled-${role.id}`}
                label={''}
                value={rolesValues ? rolesValues[role.id].disabled : false}
                onChange={(disabled) => setRolesValues({ ...rolesValues, [role.id]: { ...rolesValues[role.id], disabled } })}
              />
            </td>
            <td>
              <SwitchField
                id={`hidden-${role.id}`}
                name={`hidden-${role.id}`}
                label={''}
                value={rolesValues ? rolesValues[role.id].hidden : false}
                onChange={(hidden) => setRolesValues({ ...rolesValues, [role.id]: { ...rolesValues[role.id], hidden } })}
              />
            </td>
          </tr>
        )}
        <tr>
          <td>All</td>
          <td>
            <SwitchField
              id={`disabled-all`}
              name={`disabled-all`}
              label={''}
              value={allDisabled}
              onChange={(disabled) => {
                const rValues = {...rolesValues}
                Object.keys(rValues).forEach(k => rValues[k] = {...rValues[k], disabled })
                setRolesValues(rValues)
              }}
            />
          </td>
          <td>
            <SwitchField
              id={`hidden-all`}
              name={`hidden-all`}
              label={''}
              value={allHidden}
              onChange={(hidden) => {
                const rValues = {...rolesValues}
                Object.keys(rValues).forEach(k => rValues[k] = {...rValues[k], hidden })
                setRolesValues(rValues)
              }}
            />
          </td>
        </tr>
      </table>
    </Canvas>
  );
}