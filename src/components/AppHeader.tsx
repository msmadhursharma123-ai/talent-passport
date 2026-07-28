import React from "react";
import logo from "../assets/logo.png";

interface Props {
  schoolName?: string | null;
}

export default function AppHeader({
  schoolName = null
}: Props) {
  return (
    <>
      <header className="tp-app-header">
        <div className="tp-app-header__inner">

          {/* TALENT PASSPORT BRAND */}
          <div className="tp-app-header__brand">
            <img
              src={logo}
              alt="Talent Passport"
              className="tp-app-header__logo"
            />
          </div>

          {/* STUDENT SCHOOL IDENTITY */}
          {schoolName ? (
            <div className="tp-app-header__school">
              <div className="tp-app-header__school-name">
                {schoolName}
              </div>

              <div className="tp-app-header__school-label">
                Student Academic Workspace
              </div>
            </div>
          ) : null}

        </div>
      </header>

      <style>{`
        .tp-app-header {
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          box-sizing: border-box;
          position: relative;
          z-index: 20;
        }

  .tp-app-header__inner {
  width: 100%;
  height: 72px;
  min-height: 72px;
  padding: 6px 48px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.tp-app-header__logo {
  display: block;
  width: 400px;
  height: 130px;
  object-fit: contain;
  object-position: left center;
  flex-shrink: 0;
}

        .tp-app-header__school {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;

          min-width: 0;
          margin-left: auto;
        }

        .tp-app-header__school-name {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          text-align: right;
        }

        .tp-app-header__school-label {
          margin-top: 4px;

          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          line-height: 1.2;
          text-align: right;
        }

        /* ============================================
           TABLET
        ============================================ */

  @media (max-width: 768px) {
  .tp-app-header__inner {
    height: 72px;
    min-height: 72px;
    padding: 4px 18px;
    gap: 12px;
  }

  .tp-app-header__brand {
    width: 220px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    overflow: visible;
    flex-shrink: 0;
  }

  .tp-app-header__logo {
    width: 220px;
    height: 100px;
    max-width: none;
    max-height: none;

    display: block;
    object-fit: contain;
    object-position: left center;

    flex-shrink: 0;
  }

  .tp-app-header__school-name {
    font-size: 14px;
  }

  .tp-app-header__school-label {
    font-size: 10px;
  }
}

        /* ============================================
           MOBILE
        ============================================ */

 @media (max-width: 520px) {
  .tp-app-header {
    height: 76px;
    min-height: 76px;
  }

  .tp-app-header__inner {
    height: 76px;
    min-height: 76px;

    padding: 2px 10px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  .tp-app-header__brand {
    width: 195px;
    height: 72px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    overflow: visible;
    flex-shrink: 0;
  }

  .tp-app-header__logo {
    width: 195px;
    height: 110px;

    max-width: none;
    max-height: none;

    display: block;
    object-fit: contain;
    object-position: left center;

    flex-shrink: 0;
  }

  .tp-app-header__school {
    flex: 1 1 auto;
    min-width: 0;
    max-width: none;
    margin-left: auto;
  }

  .tp-app-header__school-name {
    font-size: 13px;
    line-height: 1.15;
  }

  .tp-app-header__school-label {
    margin-top: 2px;
    font-size: 9px;
    line-height: 1.15;
  }
}

        /* ============================================
           VERY SMALL MOBILE
        ============================================ */

  @media (max-width: 360px) {
  .tp-app-header {
    height: 72px;
    min-height: 72px;
  }

  .tp-app-header__inner {
    height: 72px;
    min-height: 72px;
    padding: 2px 8px;
    gap: 4px;
  }

  .tp-app-header__brand {
    width: 170px;
    height: 68px;
    flex-shrink: 0;
  }

  .tp-app-header__logo {
    width: 170px;
    height: 100px;
    max-width: none;
    max-height: none;
  }

  .tp-app-header__school {
    flex: 1 1 auto;
    min-width: 0;
    max-width: none;
  }

  .tp-app-header__school-name {
    font-size: 11px;
    line-height: 1.15;
  }

  .tp-app-header__school-label {
    margin-top: 2px;
    font-size: 7px;
    line-height: 1.15;
  }
}
      `}</style>
    </>
  );
}