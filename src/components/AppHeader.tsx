import React from "react";
import logo from "../assets/logo.png";

interface Props {
  schoolName?: string | null;
  workspaceLabel?: string | null;
}

export default function AppHeader({
  schoolName = null,
  workspaceLabel = null,
}: Props) {
  return (
    <>
      <header className="tp-app-header">
        <div className="tp-app-header__inner">

          {/* =================================================
              TALENT PASSPORT BRAND
          ================================================= */}

          <div className="tp-app-header__brand">
            <img
              src={logo}
              alt="Talent Passport"
              className="tp-app-header__logo"
            />
          </div>

          {/* =================================================
              AUTHENTICATED PORTAL IDENTITY

              Student Portal:
              School Name
              Student Academic Workspace

              Teacher Portal:
              School Name
              Teacher Academic Workspace

              Logged out:
              Nothing is displayed
          ================================================= */}

          {schoolName ? (
            <div className="tp-app-header__school">

              <div
                className="tp-app-header__school-name"
                title={schoolName}
              >
                {schoolName}
              </div>

              {workspaceLabel ? (
                <div className="tp-app-header__school-label">
                  {workspaceLabel}
                </div>
              ) : null}

            </div>
          ) : null}

        </div>
      </header>

      <style>{`

        /* =====================================================
           APP HEADER — DESKTOP
        ===================================================== */

      .tp-app-header {
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-sizing: border-box;
  position: relative;
  z-index: 20;
  overflow: hidden;
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

        .tp-app-header__brand {
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
        }

     .tp-app-header__logo {
  display: block;

  width: 500px;
  height: 150px;

  object-fit: contain;
  object-position: left center;

  flex-shrink: 0;
}

        /* =====================================================
           SCHOOL / PORTAL IDENTITY
        ===================================================== */

        .tp-app-header__school {
          display: flex;
          flex-direction: column;

          align-items: flex-end;
          justify-content: center;

          min-width: 0;
          max-width: 420px;

          margin-left: auto;
        }

        .tp-app-header__school-name {
          width: 100%;

          font-size: 16px;
          font-weight: 800;

          color: #0f172a;

          line-height: 1.2;
          text-align: right;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tp-app-header__school-label {
          margin-top: 4px;

          font-size: 11px;
          font-weight: 600;

          color: #64748b;

          line-height: 1.2;
          text-align: right;

          white-space: nowrap;
        }


        /* =====================================================
           TABLET
        ===================================================== */

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

    overflow: hidden;
    flex-shrink: 0;
}

      .tp-app-header__logo {
  width: 250px;
  height: 115px;

  max-width: none;
  max-height: none;

  object-fit: contain;
  object-position: left center;
}

          .tp-app-header__school {
            flex: 1 1 auto;

            min-width: 0;
            max-width: 320px;

            margin-left: auto;
          }

          .tp-app-header__school-name {
            font-size: 14px;
          }

          .tp-app-header__school-label {
            font-size: 10px;
          }
        }


        /* =====================================================
           MOBILE
        ===================================================== */

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

    overflow: hidden;

    flex-shrink: 0;
}

     .tp-app-header__logo {
  width: 275px;
  height: 185px;

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

            white-space: normal;
            overflow-wrap: break-word;

            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;

            overflow: hidden;
          }

          .tp-app-header__school-label {
            margin-top: 2px;

            font-size: 9px;
            line-height: 1.15;

            white-space: nowrap;
          }
        }


        /* =====================================================
           VERY SMALL MOBILE
        ===================================================== */

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
  width: 195px;
  height: 115px;

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