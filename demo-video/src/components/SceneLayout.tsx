import { AbsoluteFill, Img, staticFile, Audio, useCurrentFrame } from 'remotion';
import { COLORS, FPS } from '../lib/constants';

interface SceneLayoutProps {
  screenshot?: string;
  audioFile?: string;
  overlay?: boolean;
  children: React.ReactNode;
}

export const SceneLayout: React.FC<SceneLayoutProps> = ({
  screenshot,
  audioFile,
  overlay = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = Math.min(frame / (FPS * 0.5), 1);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {screenshot && (
        <Img
          src={staticFile(`screenshots/${screenshot}`)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: fadeIn,
          }}
        />
      )}
      {screenshot && overlay && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${COLORS.bgOverlay} 0%, rgba(15,23,42,0.5) 50%, ${COLORS.bgOverlay} 100%)`,
          }}
        />
      )}
      {audioFile && (
        <Audio src={staticFile(`audio/${audioFile}`)} />
      )}
      <AbsoluteFill style={{ opacity: fadeIn }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
