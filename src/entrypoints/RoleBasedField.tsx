import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas } from 'datocms-react-ui';

type PropTypes = {
  ctx: RenderFieldExtensionCtx;
};


export default function AdvancedSlug({ ctx }: PropTypes) {

  return (
    <Canvas ctx={ctx}>
      
    </Canvas>
  );
}